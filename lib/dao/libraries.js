var _ = require('underscore');
var slugs = require('slug');

var util = require('../util/util');

/**
 * Function that executes a MySQL query to fetch all the libraries and their data
 *
 * @param  {Function}  callback            Standard callback function
 * @param  {Error}     callback.error      Error object to be send with the callback function
 * @param  {Results}   callback.results    Object containing a collection of libraries
 */
var getLibraries = module.exports.getLibraries = function(callback) {

    // Create a new connection
    util.connectWithDB(function(err, connection) {
        if (err) {
            return callback(err);
        }

        // Build up the query
        var query = 'SELECT ';
        query += 'L.library_id, L.display_index, L.library_code, L.library_name, L.opening_hours, L.admits, L.stock, L.special_collections, L.services, ';
        query += 'LA.address, AT.address_type_name, T.type_code, T.type_name, DB.dbase_name ';
        query += 'FROM libraries L ';
        query += 'INNER JOIN library_addresses LA ON (L.library_id = LA.library_id) ';
        query += 'RIGHT JOIN address_types AT ON (AT.address_type_code = LA.address_type_code) ';
        query += 'RIGHT JOIN types T ON (L.type_code = T.type_code) '
        query += 'RIGHT JOIN dbases DB ON (L.dbase_id = DB.dbase_id) ';
        query += 'ORDER BY L.library_name ASC ';

        // Execute the query
        connection.query(query, function(err, rows, fields) {
            if (err) {
                callback(err);
            };

            // Create a new array to store the libraries
            var libraries = [];

            // Create an empty temporary array to store the library id's to check if no double entries are added to the collection
            var ids = [];

            // Loop all the returned rows from the database
            _.each(rows, function(row) {
                var index = ids.indexOf(row.library_id);
                var library = libraries[index];

                // Check if the library hasn't been added to the collection yet
                if (!library) {
                    libraries.push((library = {}));
                    ids.push(row.library_id);

                    // Now fill up all the information about the library
                    library['id'] = row.library_id;
                    library['url'] = slugs(row.library_name).toLowerCase();
                    library['display_index'] = row.display_index;
                    library['code'] = row.library_code;
                    library['name'] = row.library_name;
                    library['opening_hours'] = row.opening_hours;
                    library['admits'] = row.admits;
                    library['dbase'] = row.dbase_name;
                    library['stock'] = row.stock;
                    library['special_collections'] = row.special_collections;
                    library['services'] = row.services;

                    // Add the type to a separate object
                    library['type'] = {
                        'code': row.type_code,
                        'name': row.type_name
                    }
                }

                // Collect all the addresses
                if (!library[row.address_type_name.toLowerCase()]) {
                    library[row.address_type_name.toLowerCase()] = row.address;
                }
            });

            // Execute the callback function returning a collection of libraries
            callback(null, libraries);
        });

        // Close the connection after the callback has been called
        return connection.end();
    });
};
