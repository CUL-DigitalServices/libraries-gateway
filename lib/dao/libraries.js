var _ = require('underscore');
var slugs = require('slug');

var log = require('../util/logger').logger();
var util = require('../util/util');

var coordsModel = require('../models/libraries/coords');
var libraryModel = require('../models/libraries/library');

/**
 * Function that executes a MySQL query to fetch all the libraries and their data
 *
 * @param  {Function}   callback              Standard callback function
 * @param  {Error}      callback.error        Error object to be sent with the callback function
 * @param  {Library[]}  callback.libraries    Object containing a collection of libraries
 */
var getLibraries = module.exports.getLibraries = function(callback) {

    // Some extra connection parameters for the MySQL connection
    var connectionParams = {
        'multipleStatements': true
    };

    // Create a new connection
    util.connectWithDB(connectionParams, function(err, connection) {
        if (err) {
            return callback(err);
        }

        /**
         * To fetch all the necessary library data, we need to combine multiple tables.
         * (used tables: libraries, library_addresses, address_types, dbases and types)
         *
         * Since a library can have multiple types of addresses (e.g. address, web, twitter, facebook...), these are stored separately.
         * But we want only one record per library, therefore, we use a subquery that retrieves all the addresses and there types.
         * By concatinating the columns and their rows, we can store them as a single json-string in the library record.
         * We return each address type concatinated with an underscore and its unique address id, since JSON loses data when parsing the string.
         * The other table joins are more trivial since most of them only have a one-on-one relation.
         */
        var query = 'SET SESSION group_concat_max_len = 1000000;';

        query += 'SELECT L.library_id, L.library_code, L.library_name, T.type_code, T.type_name, ';
        query += 'L.opening_hours, L.admits, L.stock, L.special_collections, L.services, DBS.dbase_name, ';

        // Addresses
        query += 'CONCAT("{", ';
        query += '(SELECT GROUP_CONCAT(CONCAT(\'"\', LOWER(address_type_name), \'_\', address_id, \'":"\', address,\'"\') SEPARATOR \',\') ';
        query += 'FROM library_addresses LA ';
        query += 'LEFT JOIN address_types AT ON (LA.address_type_code = AT.address_type_code) ';
        query += 'WHERE LA.library_id = L.library_id),';
        query += '"}"';
        query += ') AS addresses, ';

        // Staff
        query += 'CONCAT(\'{\', ';
        query += '(SELECT GROUP_CONCAT(';
        query += 'CONCAT(\'"\', ';
        query += 'LRI.raven_id, \'": {\', ';
        query += '\'"position": "\', LRI.job_title, \'", \', ';
        query += '\'"display_email": "\', LRI.display_email, \'", \', ';
        query += '\'"display_title": "\', LRI.display_title, \'", \', ';
        query += '\'"title": "\', IFNULL(RI.title,1), \'", \', ';
        query += '\'"name": "\', RI.first_name, " ", RI.last_name, \'", \', ';
        query += '\'"email": "\', RI.email, \'"\', ';
        query += '\'}\') ORDER BY LRI.display_ranking SEPARATOR ", "';
        query += ') FROM library_raven_ids LRI ';
        query += 'INNER JOIN raven_ids RI ON (LRI.raven_id = RI.raven_id) ';
        query += 'WHERE L.library_id = LRI.library_id AND LRI.display_user = "Y"),';
        query += '\'}\') AS staff ';

        query += 'FROM libraries L ';
        query += 'RIGHT JOIN dbases DBS ON (L.dbase_id = DBS.dbase_id) ';
        query += 'RIGHT JOIN types T ON (L.type_code = T.type_code) ';
        query += 'ORDER BY L.library_name ASC';

        // Execute the query
        connection.query(query, function(err, resultset, fields) {
            if (err) {
                return callback(err);
            };

            // Create a new array to store all the libraries
            var libraries = [];

            // Get all the libraries from the resultset
            var rows = resultset[1];

            // Loop all the returned rows from the database
            for (var i=0; i<rows.length; i++) {

                // Cache the current row
                var row = rows[i];

                // Fill up the library model
                var id = row.library_id;
                var code = row.library_code;
                var name = row.library_name;
                var url = slugs(row.library_name).toLowerCase();

                var type = new libraryModel.Type(row.type_code, row.type_name);

                var opening_hours = row.opening_hours;
                var admits = row.admits;
                var stock = row.stock;
                var special_collections = row.special_collections;
                var services = row.services;
                var dbase = row.dbase_name;

                // Try to parse the addresses
                try {
                    var addresses = JSON.parse(row.addresses);

                    var coords = null;
                    if (getAddressValuesByType(addresses, 'latlng')) {
                        coords = getAddressValuesByType(addresses, 'latlng')[0].split(',');
                        coords = new coordsModel.Coords(coords[0], coords[1]);
                    }

                    // Since some libraries can have multiple addresses of the same type,
                    // we filter the object and return the addresses as an array.
                    var email = getAddressValuesByType(addresses, 'email');
                    var address = getAddressValuesByType(addresses, 'address');
                    var telephone = getAddressValuesByType(addresses, 'telephone');
                    var fax = getAddressValuesByType(addresses, 'fax');
                    var web = getAddressValuesByType(addresses, 'web');
                    var map = getAddressValuesByType(addresses, 'map');
                    var facebook = getAddressValuesByType(addresses, 'facebook');
                    var blog = getAddressValuesByType(addresses, 'blog');
                    var twitter = getAddressValuesByType(addresses, 'twitter');

                // Execute callback when parsing fails
                } catch (e) {
                    log().error(e);
                    return callback("Parsing library address data failed");
                }

                // Create a new collection for the staff
                var staff = [];

                // Try to parse the staff
                try {
                    if (row.staff !== null) {

                        // Parse the received JSON-string
                        var staffObject = JSON.parse(row.staff);

                        // Loop each member from the staff object
                        _.each(staffObject, function(member) {

                            var title = member.title;
                            var name = member.name;
                            var email = member.email;
                            var position = member.position;
                            var display_title = member.display_title;
                            var display_email = member.display_email;

                            // Create a new model for each staff member
                            var staffModel = new libraryModel.Staff(title, name, email, position, display_email, display_title);
                            staff.push(staffModel);
                        });
                    }
                } catch (e) {
                    return callback("Parsing library staff data failed");
                }

                // Create a new model for each library
                var library = new libraryModel.Library(id, code, name, url, type, coords, email, address, telephone, fax, web, map,
                    facebook, blog, twitter, opening_hours, admits, stock, special_collections, services, staff, dbase);

                // Add the library to the libraries collection
                libraries.push(library);
            }

            // Execute the callback function returning a collection of libraries
            callback(null, libraries);

            // Close the connection with the database after executing the callback function
            return connection.end();
        });
    });
};

/**
 * Function that executes a MySQL query to fetch a specific library by its slug.
 *
 * @param  {String}    slug                The slugged name of the library
 * @param  {Function}  callback            Standard callback function
 * @param  {Error}     callback.error      Error object to be sent with the callback function
 * @param  {Library}   callback.library    Object containing a specified library
 */
var getLibraryBySlug = module.exports.getLibraryBySlug = function(slug, callback) {

    /**
     * Since the slugs are not stored in the database, we need to call 'getLibraries' first to fetch all the libraries.
     * After the data is retrieved from the database, the slugs are created and put in the library model.
     * Afterwards, we filter the library collection by using the slug that is provided as a query parameter.
     */
    getLibraries(function(err, libraries) {
        if (err) {
            return callback(err);
        }

        // Now filter the library from the results
        var library = _.find(libraries, function(lib) {
            return lib.url === slug;
        }) || null;

        // Execute the callback function and return the library
        return callback(null, library);
    });
};

/**
 * Function that picks one or more specific address values from the address object.
 *
 * @param  {Object}     addresses    Object containing all the addresses of a library
 * @param  {String}     type         The address type that is needed to filter the object
 * @return {Address[]}               Collection of addresses that match the given type
 * @api private
 */
var getAddressValuesByType = function(_addresses, type) {

    // Create an empty address array to store the matching addresses
    var addresses = [];

    // Loop all the addresses in the object
    _.each(_addresses, function(address, key) {

        // Since the key is stored with an underscore and id (e.g. email_43, twitter_36...),
        // we need to split the string to be able to compare it with the requested type.
        if (key.split('_')[0] === type) {
            addresses.push(address);
        }
    });

    // Only return an array if it has children, otherwise return null
    return (addresses.length) ? addresses : null;
};
