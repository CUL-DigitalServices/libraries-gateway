var mysql = require('mysql');

var logger = require('./logger').logger();

var config = require('../../config');

/**
 * Function that initializes a connection with the database
 * @see https://github.com/felixge/node-mysql
 *
 * @param  {Object}      extraParams            Extra parameters for the connection
 * @param  {Function}    callback               Standard callback function
 * @param  {Connection}  callback.err           The thrown error
 * @param  {Connection}  callback.connection    The created connection
 */
var connectWithDB = module.exports.connectWithDB = function(extraParams, callback) {

    // Try setting up a new connection
    try {

        var settings = config.secret.libraries.db;
        var connection = mysql.createConnection({
          'host': settings.host,
          'database': settings.database,
          'user': settings.user,
          'password': settings.password,
          'multipleStatements': extraParams.multipleStatements || false
        });

        // Connect
        connection.connect();

        // Callback
        return callback(null, connection);

    // When setting up a connection fails
    } catch(err) {
        return callback(err);
    }
};

/**
 * Function that returns the current node
 *
 * @param  {Request}  req    Request object
 * @return {Object}          The current node
 */
var getCurrentNode = module.exports.getCurrentNode = function(req) {
    // Get the main node from the request
    var node = config.nodes['home'];
    if (req.route) {
        // Since we receive the path as a string, we need to split on slashes
        var nodes = req.route.path.split('/');
        nodes.splice(0,1);
        node = config.nodes[nodes[0]] || config.nodes['home'];
    }
    return node;
};
