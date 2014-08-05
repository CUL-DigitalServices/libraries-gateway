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

var express = require('express');
var util = require('util');

var config = require('../../config');
var log = require('lg-util/lib/logger').logger();
var Server = require('lg-util/lib/server');

var Tests = require('./lib/tests');

var PORT = 5001;
var SERVER = 'apitest';

/**
 * Initialize the tests
 *
 * @api private
 */
var init = function() {

    // Create a new Express server
    Server.createServer(SERVER, PORT)

        // Register the routes for the server
        .then(registerRoutes)

        // Initialize the tests
        .then(Tests.init)

        // Add an error handler
        .catch(errorHandler);
};

/**
 * Register the routes for the created server
 *
 * @param  {Express}    app     The Express server the routes should be registered for
 * @api private
 */
var registerRoutes = function(app) {

    // Register the static folders
    app.use('/static', express.static(__dirname + '/static'));

    // Return the tests html file
    app.get('/', function(req, res) {
        return res.status(200).sendfile(__dirname + '/static/index.html');
    });

    // Register the tests endpoint
    app.post('/getResults', Tests.getResults);

    log().info(util.format('Test server for %s started at %s://%s:%s', config.app.title, config.server.protocol, config.server.host, PORT));
};

/**
 * Output the errors
 *
 * @param  {Error}      err         Object containing the error code and error message
 * @api private
 */
var errorHandler = function(err) {

    // Output the error
    log().error(err, err.msg);
};

init();
