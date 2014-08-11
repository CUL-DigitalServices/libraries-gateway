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

var config = require('../config');
var log = require('lg-util/lib/logger').logger();
var Server = require('lg-util/lib/server');

var SearchTest = require('./lib/search/tests');
var WidgetTest = require('./lib/widgets/app');

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

        .then(createServerCompleteHandler)

        // Register the routes for the server
        .then(registerRoutes)

        // Initialize the tests
        .then(SearchTest.init)

        // Add an error handler
        .catch(errorHandler);
};

/**
 * Caches the created application and socket server
 *
 * @param  {Object}     promise         The promised object
 * @param  {Express}    promise.app     The Express server the routes should be registered for
 * @param  {Socket}     promise.io      The socket server object
 * @api private
 */
var createServerCompleteHandler = function(promise) {

    // Cache the created application server
    app = promise.app;

    // Cache the created socket server
    io = promise.io;

    // Register the events after the connection has been established
    io.sockets.on('connection', function(socket) {
        log().info('client connected');

        // When the client requests the API results
        socket.on('getResults', function() {
            log().info('client requested sockets');

            // Fetch the results
            SearchTest.getResults()

                // Emit the results to the client
                .then(function(results) {
                    socket.emit('getResults', JSON.stringify(results));
                })

                // Emit the current progress of the queries
                .progress(function(progress) {
                    socket.emit('onProgress', progress);
                })

                // Emit an error to the client
                .catch(function(err) {
                    socket.emit('onError', JSON.stringify(err));
                });
        });
    });
};

/**
 * Register the routes for the created server
 *
 * @api private
 */
var registerRoutes = function() {

    // Register the static folders
    app.use('/static', express.static(__dirname + '/static'));

    // Comparison
    app.get('/comparison', SearchTest.getContent);

    // Widgets
    app.get('/widgets', WidgetTest.getContent);
    app.get('/widgets/getResults', WidgetTest.getResults);

    // Return the tests html file
    app.get('/', function(req, res) {
        return res.status(200).sendFile(__dirname + '/static/index.html');
    });

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
