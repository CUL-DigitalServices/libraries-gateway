var express = require('express');
var swagger = require('swagger-node-express');

var config = require('../../../config');

var swaggerController = require('../swagger/');
var swaggerModel = require('../../models/swagger/');

/**
 * Function that initializes Swagger
 * @see https://github.com/wordnik/swagger-node-express
 * @private
 */
var initializeSwagger = function(root, app) {
    swagger.setAppHandler(app);
    swagger.configureSwaggerPaths('', '/api-docs', '');
    swagger.addModels(swaggerModel);
    swagger.addGet(swaggerController.getLibraries);
    swagger.addGet(swaggerController.getLibrariesById);
    swagger.addGet(swaggerController.getResults);
    swagger.configure('http://localhost:5000/api-docs', '0.1');
};

/**
 * Function that creates a new Express webserver
 * @see http://www.expressjs.com
 *
 * @param  {String}    root            The application root
 * @param  {Function}  callback        Standard callback function
 * @param  {Express}   callback.app    The ExpressJS app object
 * @param  {Number}    attempts        Number of attempts trying to set up a new webserver
 */
var createServer = module.exports.createServer = function(root, callback, attempts) {

    console.log('Trying to spin up ' + config.app.title + ' at http://localhost:' + config.server.port);

    // Keep track of the attempts of setting up a new webserver
    attempts = attempts || 0;
    if (attempts === 10) {
        return console.error('Could not spin up ' + config.app.title + ' at http://localhost:' + config.server.port + ' in 10 attempts');
    }

    // Create a new Express object
    app = express();
    app.set('views', root + '/lib/views');
    app.set('view engine', 'ejs');
    app.use(app.router);
    app.use(express.logger('dev'));
    app.use(express.methodOverride());
    app.use(express.static(root + '/public'));

    // Try and listen on the specified port
    var server = app.listen(config.server.port);

    // When the server successfully begins listening, invoke the callback
    server.once('listening', function() {
        server.removeAllListeners('error');

        // Initialize Swagger
        initializeSwagger(root, app);

        // Display a message in the console when the server has been started successfully
        var attemptsString = ((attempts++) > 1) ? 'attempts' : 'attempt';
        console.log(config.app.title + ' started at http://localhost:' + config.server.port + ' with ' + attempts + ' ' + attemptsString);

        return callback(app);
    });

    // If there is an error connecting, try again
    server.once('error', function(err) {
        server.removeAllListeners('listening');
        return setTimeout(function() {
            createServer(callback, attempts + 1)
        }, 1000);
    });
};
