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
var swagger = require('swagger-express');
var util = require('util');

var config = require('../../config');
var log = require('./logger').logger();

var LibrariesAPI = require('../controllers/api/libraries');
var SearchRESTAPI = require('../controllers/api/search/rest');

var AccountController = require('../controllers/client/nodes/AccountController').AccountController;
var BlogsController = require('../controllers/client/nodes/BlogsController').BlogsController;
var HomeController = require('../controllers/client/nodes/HomeController').HomeController;
var LibrariesController = require('../controllers/client/nodes/LibrariesController').LibrariesController;
var ResourcesController = require('../controllers/client/nodes/ResourcesController').ResourcesController;
var UsingLibrariesController = require('../controllers/client/nodes/UsingLibrariesController').UsingLibrariesController;

var ErrorHandler = require('../controllers/error/ErrorHandler').ErrorHandler;

////////////////////////
//  PUBLIC FUNCTIONS  //
////////////////////////

/**
 * Function that creates a new Express webserver
 *
 * @param  {Function}   callback            Standard callback function
 * @param  {Error}      callback.err        Object containing the error code and error message
 * @param  {Express}    callback.server     The ExpressJS server object
 */
var createServer = module.exports.createServer = function(callback) {
    log().info(util.format('Trying to spin up %s', config.app.title));
    callback = callback || function() {};

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
    var server = app.listen(config.server.port);

    // Invoke the callback when the server is spun up successful
    server.once('listening', function() {
        server.removeAllListeners('error');

        // Register the routes
        registerRoutes(app);

        // Return the created server
        log().info(util.format('%s started at %s://%s:%s', config.app.title, config.server.protocol, config.server.host, config.server.port));
        return callback(null, server);
    });

    // Return an error if spinning up the server failed
    server.once('error', function(err) {
        server.removeAllListeners('listening');

        // Return an error
        log().error({'code': 500, 'msg': 'Could not spin up server'}, 'Error while spinning up server');
        return callback({'code': 500, 'msg': 'Could not spin up server', 'err': err});
    });
};

//////////////////////////
//  INTERNAL FUNCTIONS  //
//////////////////////////

/**
 * Function that registers the routes after the server has been started
 *
 * @param  {Express}    app     The Express application
 */
var registerRoutes = function(app) {

    ////////////////
    // API routes //
    ////////////////

    app.get('/api/libraries', LibrariesAPI.getLibraries);
    app.get('/api/libraries/:slug', LibrariesAPI.getLibraryBySlug);
    app.get('/api/search', SearchRESTAPI.getResults);
    app.get('/api/search/facets', SearchRESTAPI.getFacetsForResults);
    app.get('/api/search/:api', SearchRESTAPI.getResultById);

    ///////////////////
    // Client routes //
    ///////////////////

    // Home
    var homeController = new HomeController();
    app.get('/', homeController.getContent);

    // Blog
    var blogsController = new BlogsController();
    app.get('/blogs', blogsController.getContent);

    // Find a library
    var librariesController = new LibrariesController();
    app.get('/find-a-library', librariesController.getContent);
    app.get('/find-a-library/:id', librariesController.getLibraryDetail);

    // Find a resource
    var resourcesController = new ResourcesController();
    app.get('/find-a-resource', resourcesController.getContent);
    app.get('/find-a-resource/facets', resourcesController.getFacetsForResults);
    app.get('/find-a-resource/:api/:id', resourcesController.getResourceDetail);

    // My account
    var accountController = new AccountController();
    app.get('/my-account', accountController.getContent);

    // Using our libraries
    var usingLibrariesController = new UsingLibrariesController();
    app.get('/using-our-libraries', usingLibrariesController.getContent);

    ////////////
    // ERRORS //
    ////////////

    // ErrorHandler
    var errorHandler = new ErrorHandler();
    app.use(errorHandler.getErrorPage);
};
