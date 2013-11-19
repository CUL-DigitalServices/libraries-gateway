var _ = require('underscore');
var mysql = require('mysql');

var config = require('../../config');

/**
 * Function that executes a MySQL query to fetch the FAQ's
 *
 * @param  {Function}  callback            Standard callback function
 * @param  {Error}     callback.error      Error object to be send with the callback function
 * @param  {Results}   callback.results    Object containing a collection of faq's
 */
var getFaqs = module.exports.getFaqs = function(callback) {

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
    var query = 'SELECT * ';
    query += 'FROM faqs F';

    // Execute the query
    connection.query(query, function(err, rows, fields) {
        if (err) {
            callback(err);
        };

        callback(null, rows);
    });

    // Close the connection
    return connection.end();
};
