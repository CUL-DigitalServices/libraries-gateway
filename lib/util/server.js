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
var express = require('express');
var q = require('q');
var swagger = require('swagger-express');
var util = require('util');

var config = require('../../config');
var log = require('./logger').logger();

// Cache the created servers
var servers = {};

////////////////////////
//  PUBLIC FUNCTIONS  //
////////////////////////

/**
 * Function that creates a new Express webserver
 *
 * @param  {String}     name                The server's name
 * @param  {Number}     port                The port the server will be running on
 */
var createServer = module.exports.createServer = function(name, port) {
    var deferred = q.defer();

    // Set the server name
    name = name || 'librariesgateway';

    log().info(util.format('Trying to spin up %s', config.app.title));

    // Use the specified port if specified or the default port from the configuration
    port = port || config.server.port;

    // Create a new Express object
    var app = express();
    app.locals = {
        'searchUtil': require('./search'),
        'timeago': require('timeago'),
        'twitterText': require('twitter-text')
    };
    app.set('views', config.app.root + '/lib/views');
    app.set('view engine', 'ejs');
    app.use('/public', express.static(config.app.ui));

    // Listen to the specified port
    servers[name] = app.listen(port);

    // Invoke the callback when the server is spun up successful
    servers[name].once('listening', function() {
        log().info(util.format('%s started at %s://%s:%s', config.app.title, config.server.protocol, config.server.host, port));

        // Remove the event listener
        servers[name].removeAllListeners('error');

        // Resolve the promise
        deferred.resolve(app);
    });

    // Return an error if spinning up the server failed
    servers[name].once('error', function(err) {
        log().error({'code': 500, 'msg': 'Could not spin up server'}, 'Error while spinning up Express server');

        // Remove the event listener
        servers[name].removeAllListeners('listening');

        // Reject the promise
        deferred.reject({'code': 500, 'msg': 'Could not spin up server', 'err': err});
    });

    // Return a promise
    return deferred.promise;
};

/**
 * Function that closes down an Express server
 */
var closeServer = module.exports.closeServer = function(name) {
    log().info(util.format('Shutting down server for %s', config.app.title));

    // Close the server
    if (servers[name]) {
        servers[name].close();
    }
};
