var _ = require('underscore');
var slugs = require('slug');

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

    // Create a new connection
    util.connectWithDB(function(err, connection) {
        if (err) {
            return callback(err);
        }

        /**
         * To fetch all the necessary library data, we need to combine multiple tables.
         * (used tables: libraries, library_addresses, address_types, dbases and types)
         *
         * Since a library can have multiple types of addresses, these are stored separately. But we want only one record per library,
         * therefore, we use a subquery that retrieves all the addresses and there types. By concatinating the columns and their rows, we can store them 
         * as a single json-string in the library record. The other table joins are more trivial since most of them only have a one-on-one relation.
         */
        var query = 'SELECT L.library_id, L.library_code, L.library_name, T.type_code, T.type_name, ';
        query += 'CONCAT("{", ';
        query += '(SELECT GROUP_CONCAT(CONCAT(\'"\',LOWER(address_type_name),\'":"\',address,\'"\') SEPARATOR \',\') FROM library_addresses LA ';
        query += 'LEFT JOIN address_types AT ON (LA.address_type_code = AT.address_type_code) ';
        query += 'WHERE LA.library_id = L.library_id),';
        query += '"}"';
        query += ') AS addresses, ';
        query += 'L.opening_hours, L.admits, L.stock, L.special_collections, L.services, DBS.dbase_name ';
        query += 'FROM libraries L ';
        query += 'LEFT JOIN dbases DBS ON (L.dbase_id = DBS.dbase_id) ';
        query += 'RIGHT JOIN types T ON (L.type_code = T.type_code) ';
        query += 'ORDER BY L.display_index ASC';

        // Execute the query
        connection.query(query, function(err, rows, fields) {
            if (err) {
                callback(err);
            };

            // Create a new array to store all the libraries
            var libraries = [];

            // Loop all the returned rows from the database
            _.each(rows, function(row) {

                // Fill up the library model
                try {
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
                        if (addresses['latlng']) {
                            var splitted = addresses['latlng'].split(',');
                            coords = new coordsModel.Coords(splitted[0], splitted[1]);
                        }

                        var email = addresses.email;
                        var address = addresses.address;
                        var telephone = addresses.telephone;
                        var fax = addresses.fax;
                        var web = addresses.web;
                        var map = addresses.map;

                    // Execute callback when parsing fails
                    } catch (e) {
                        return callback("Parsing library data failed");
                    }

                    // Create a new model for each library
                    var library = new libraryModel.Library(id, code, name, url, type, email, coords, address, telephone, fax, web, map, 
                        opening_hours, admits, stock, special_collections, services, dbase);

                    // Add the library to the libraries collection
                    libraries.push(library);

                // Execute callback when populating library models fails
                } catch (e) {
                    return callback("Populating library collection failed");
                }
            });

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
        });

        // Execute the callback function and return the library
        return callback(null, library);
    });
};
