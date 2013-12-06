var express = require('express');
var swagger = require('swagger-node-express');

var config = require('../../config');

var swaggerController = require('../controllers/swagger/');
var swaggerModel = require('../models/swagger/');

var _app = null;
var _hostName = null;

/**
 * Function that initializes Swagger
 * @see https://github.com/wordnik/swagger-node-express
 * @private
 */
var initializeSwagger = function(root) {
    swagger.setAppHandler(_app);
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
        return console.error('Could not spin up ' + config.app.title + ' at http://localhost:' + String(config.server.port) + ' in 10 attempts');
    }

    // Create a new Express object
    _app = express();
    _app.locals({
        'host': null,
        'timeago': require('timeago'),
        'twitterText': require('twitter-text')
    });
    _app.set('views', root + '/lib/views');
    _app.set('view engine', 'ejs');
    _app.use(_app.router);
    _app.use(express.logger('dev'));
    _app.use(express.methodOverride());
    _app.use('/public', express.static(root + '/public'));

    // Try and listen on the specified port
    var server = _app.listen(config.server.port);

    // When the server successfully begins listening, invoke the callback
    server.once('listening', function() {
        server.removeAllListeners('error');

        // Initialize Swagger
        initializeSwagger(root);

        // Display a message in the console when the server has been started successfully
        var attemptsString = ((attempts++) > 1) ? 'attempts' : 'attempt';
        console.log(config.app.title + ' started at http://localhost:' + String(config.server.port) + ' with ' + attempts + ' ' + attemptsString);

        return callback(_app);
    });

    // If there is an error connecting, try again
    server.once('error', function(err) {
        server.removeAllListeners('listening');
        return setTimeout(function() {
            createServer(callback, attempts + 1)
        }, 1000);
    });
};


var setHostName = module.exports.setHostName = function(req) {
    if (!_app.locals.host) {
        _app.locals.host = req.header('host');
    }
};
