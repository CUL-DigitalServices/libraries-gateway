/*!
 * Copyright 2014 Digital Services, University of Cambridge Licensed
 * under the Educational Community License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

var _ = require('underscore');
var mysql = require('mysql');

var log = require('./logger').logger();

var config = require('../../config');

////////////////////////
//  PUBLIC FUNCTIONS  //
////////////////////////

/**
 * Function that initializes a connection with the database
 * @see https://github.com/felixge/node-mysql
 *
 * @param  {Object}         extraParams             Extra parameters for the connection
 * @param  {Function}       callback                Standard callback function
 * @param  {Connection}     callback.err            The thrown error
 * @param  {Connection}     callback.connection     The created connection
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
        connection.connect(function(error) {
            if (error) {
                log().error(error);
                return callback(error);
            }
            return callback(null, connection);
        });

    // When setting up a connection fails
    } catch(error) {
        log().error(error);
        return callback(error);
    }
};

/**
 * Function that returns a variable as its value or as null
 *
 * @param  {Object}     value       The value that needs to be checked
 */
var consolidateValue = module.exports.consolidateValue = function(value) {
    if (value && value !== undefined) {
        return value;
    }
    return null;
};

/**
 * Function that returns the current node
 *
 * @param  {Request}    req         Request object
 * @return {Object}                 The current node
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

/**
 * Function that puts a value into a new empty array if it's not null
 *
 * @param  {Object}     value       The value that needs to be put into a new empty array
 * @return {Array}                  The array with the value
 */
var putInArrayIfNotNull = module.exports.putInArrayIfNotNull = function(value) {
    if (value && !_.isArray(value)) {
        return [value];
    }
    return value;
};
