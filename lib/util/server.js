var _ = require('underscore');
var express = require('express');
var swagger = require('swagger-express');

var log = require('./logger').logger();
var util = require('util');

var config = require('../../config');

var _app = null;

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

    log().info('Trying to spin up ' + config.app.title + ' at http://localhost:' + config.server.port);

    // Keep track of the attempts of setting up a new webserver
    attempts = attempts || 0;
    if (attempts === 10) {
        return log().warn('Could not spin up ' + config.app.title + ' at http://localhost:' + String(config.server.port) + ' in 10 attempts')
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

        // Swagger requires that you return the full URL to the base path of your API including the hostname
        var basePath = util.format('http://%s/api', config.app.hostname);

        // Initialize swagger
        _app.use(swagger.init(_app, {
            'swaggerUI': '../../public/swagger/',
            'basePath': basePath,
            'apis': ['lib/controllers/api/libraries/index.js', 'lib/controllers/api/search/index.js']
        }));

        // Display a message in the console when the server has been started successfully
        var attemptsString = ((attempts++) > 1) ? 'attempts' : 'attempt';
        log().info(config.app.title + ' started at http://localhost:' + String(config.server.port) + ' with ' + attempts + ' ' + attemptsString);

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
