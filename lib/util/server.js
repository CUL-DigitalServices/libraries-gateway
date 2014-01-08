var _ = require('underscore');
var express = require('express');
var swagger = require('swagger-express');

var log = require('./logger').logger();
var util = require('util');

var config = require('../../config');

var _app = null;

/**
 * Function that registers the routes after the server has been started
 */
var registerRoutes = function() {

    ////////////////
    // API routes //
    ////////////////

    // This displays an instance of the Swagger UI
    _app.get('/api', function(req, res) {
        res.sendfile(__dirname + '/public/swagger/index.html');
    });

    _app.get('/api/libraries', require('../controllers/api/libraries').getLibraries);
    _app.get('/api/libraries/:slug', require('../controllers/api/libraries').getLibraryBySlug);
    _app.get('/api/search', require('../controllers/api/search').getCombinedResults);
    _app.get('/api/search/:api', require('../controllers/api/search').getResultsFromIndex);

    ///////////////////
    // Client routes //
    ///////////////////

    // Home
    _app.get('/', require('../controllers/client/nodes/home').getContent);

    // Blog
    _app.get('/blogs', require('../controllers/client/nodes/blogs').getContent);

    // Find a library
    _app.get('/find-a-library', require('../controllers/client/nodes/libraries').getContent);
    _app.get('/find-a-library/:id', require('../controllers/client/nodes/libraries').getLibraryDetail);

    // Find a resource
    _app.get('/find-a-resource',  require('../controllers/client/nodes/resources').getContent);
    _app.get('/find-a-resource/:api',  require('../controllers/client/nodes/resources').getResourceDetail);
    _app.get('/find-a-resource/:api/:id',  require('../controllers/client/nodes/resources').getResourceDetail);

    // My account
    _app.get('/my-account', require('../controllers/client/nodes/account').getContent);

    // Using our libraries
    _app.get('/using-our-libraries', require('../controllers/client/nodes/usinglibraries').getContent);

    ////////////
    // ERRORS //
    ////////////

    // ErrorHandler
    _app.use(require('../controllers/error/errorHandler').getErrorPage);
};

/**
 * Function that creates a new Express webserver
 * @see http://www.expressjs.com
 *
 * @param  {Function}  callback        Standard callback function
 * @param  {Express}   callback.app    The ExpressJS app object
 * @param  {Number}    attempts        Number of attempts trying to set up a new webserver
 */
var createServer = module.exports.createServer = function(callback, attempts) {

    log().info('Trying to spin up ' + config.app.title + ' at http://localhost:' + config.server.port);

    // Keep track of the attempts of setting up a new webserver
    attempts = attempts || 0;
    if (attempts === 10) {
        return log().warn('Could not spin up ' + config.app.title + ' at http://localhost:' + String(config.server.port) + ' in 10 attempts')
    }

    // Pick the root out of the process' envinronment
    var root = process.env['PWD'];

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

        // Register the routes
        registerRoutes();

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

        if (callback) {
            return callback(_app);
        }
    });

    // If there is an error connecting, try again
    server.once('error', function(err) {
        server.removeAllListeners('listening');
        return setTimeout(function() {
            createServer(callback, attempts + 1)
        }, 1000);
    });
};

/**
 * Function that sets the hostname of the application
 *
 * @param  {Request}  req    Request object
 */
var setHostName = module.exports.setHostName = function(req) {
    if (!_app.locals.host) {
        _app.locals.host = req.header('host');
    }
};
