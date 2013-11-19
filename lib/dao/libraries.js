var _ = require('underscore');
var mysql = require('mysql');

var config = require('../../config');

/**
 * Function that executes a MySQL query to fetch all the libraries and their data
 *
 * @param  {Function}  callback            Standard callback function
 * @param  {Error}     callback.error      Error object to be send with the callback function
 * @param  {Results}   callback.results    Object containing a collection of libraries
 */
var getLibraries = module.exports.getLibraries = function(callback) {

    // Create a new connection
    var connection = mysql.createConnection({
      'host': config.constants.libraries.db.host,
      'database': config.constants.libraries.db.database,
      'user': config.constants.libraries.db.user,
      'password': config.constants.libraries.db.password,
    });

    // Connect
    connection.connect();

    // Build up the query
    var query = 'SELECT ';
    query += 'L.library_id, L.display_index, L.library_code, L.library_name, L.admits, L.stock, L.special_collections, L.services, ';
    query += 'LA.address, AT.address_type_name, T.type_code, T.type_name, DB.dbase_name ';
    query += 'FROM libraries L ';
    query += 'INNER JOIN library_addresses LA ON (L.library_id = LA.library_id) ';
    query += 'RIGHT JOIN address_types AT ON (AT.address_type_code = LA.address_type_code) ';
    query += 'RIGHT JOIN types T ON (L.type_code = T.type_code) '
    query += 'RIGHT JOIN dbases DB ON (L.dbase_id = DB.dbase_id) '
    query += 'ORDER BY L.display_index DESC';

    // Execute the query
    connection.query(query, function(err, rows, fields) {
        if (err) {
            callback(err);
        };

        // Loop each row from the 
        var temp = {};
        _.each(rows, function(row) {

            // First check if the library has already been added to the libraries collection
            if (!temp[row.library_id]) {
                temp[row.library_id] = {};
            }

            // Now fill up all the information about the library
            temp[row.library_id]['id'] = row.library_id;
            temp[row.library_id]['code'] = row.library_code;
            temp[row.library_id]['name'] = row.library_name;
            temp[row.library_id]['admits'] = row.admits;
            temp[row.library_id]['dbase'] = row.dbase_name;
            temp[row.library_id]['stock'] = row.stock;
            temp[row.library_id]['special_collections'] = row.special_collections;
            temp[row.library_id]['services'] = row.services;

            // Add the type to a separate object
            temp[row.library_id]['type'] = {
                'code': row.type_code,
                'name': row.type_name
            }

            // Collect all the addresses
            if (!temp[row.library_id][row.address_type_name.toLowerCase()]) {
                temp[row.library_id][row.address_type_name.toLowerCase()] = row.address;
            }
        });

        // Convert the result to an array
        var libraries = [];
        _.each(temp, function(item) {
            libraries.push(item);
        });

        callback(null, libraries);
    });

    // Close the connection
    return connection.end();
};
