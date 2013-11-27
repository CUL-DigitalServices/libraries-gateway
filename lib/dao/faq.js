var _ = require('underscore');

var util = require('../util/util');

/**
 * Function that executes a MySQL query to fetch the FAQ's
 *
 * @param  {Function}  callback            Standard callback function
 * @param  {Error}     callback.error      Error object to be sent with the callback function
 * @param  {Results}   callback.results    Object containing a collection of faq's
 */
var getFaqs = module.exports.getFaqs = function(callback) {

    // Create a new connection
    util.connectWithDB(function(err, connection) {
        if (err) {
            return callback(err);
        }

        // Build up the query
        var query = 'SELECT F.*, FT.* ';
        query += 'FROM faqs F ';
        query += 'LEFT JOIN faq_types FT ON (F.faq_id = FT.faq_type_id)';

        // Execute the query
        connection.query(query, function(err, rows, fields) {
            if (err) {
                callback(err);
            };

            callback(null, rows);
        });

        // Close the connection
        return connection.end();
    });
};
