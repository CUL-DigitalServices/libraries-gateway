var mysql = require('mysql');

var config = require('../../config');

/**
 * Function that initializes a connection with the database
 *
 * @param  {Function}    callback               Standard callback function
 * @param  {Connection}  callback.err           The thrown error
 * @param  {Connection}  callback.connection    The created connection
 */
var connectWithDB = module.exports.connectWithDB = function(callback) {

    // Try setting up a new connection
    try {

        // Connection parameters
        var connection = mysql.createConnection({
          'host': config.constants.libraries.db.host,
          'database': config.constants.libraries.db.database,
          'user': config.constants.libraries.db.user,
          'password': config.constants.libraries.db.password,
        });

        // Connect
        connection.connect();

        // Callback
        return callback(null, connection);

    // When setting up a connection fails 
    } catch (e) {
        return callback(e);
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
