var _ = require('underscore');
var request = require('request');
var util = require('util');

var config = require('../../../../config');

var libutil = require('../../../util/util');
var log = require('../../../util/logger').logger();
var server = require('../../../util/server');

var indexController = require('../IndexController');
var BaseViewController = require('../BaseViewController').BaseViewController;
var navigationController = require('../partials/navigation');

/**
 * Constructor
 */
var LibrariesController = module.exports.LibrariesController = function() {
    LibrariesController.super_.apply(this, arguments);
    var that = this;

    /**
     * Function that renders the libraries template
     *
     * @param  {Request}   req    Request object
     * @param  {Response}  res    Response object
     */
    that.getContent = exports.getContent = function(req, res) {

        // Check if hostname is set in application locals
        server.setHostName(req);

        // Render the navigation template
        navigationController.getContent(req, res, function(err, navigation) {
            if (err) {
                log().error(err);
                return res.send(500);
            }

            // Request options object
            var options = {
                'timeout': 5000,
                'url': 'http://' + req.headers.host + '/api/libraries'
            };

            // Initialize some parameters to pass to the template body
            var params = {
                'currentNode': libutil.getCurrentNode(req),
                'partials': {
                    'navigation': navigation
                },
                'title': config.app.title
            };

            // Perform a request to the API
            request(options, function(error, result, body) {

                // If an error occured during the request, return a 500 error page
                if (error) {

                    // Render the error page
                    return that.renderTemplate(req, res, params, 'errors/500', 'error-500');

                } else {

                    // Add the libraries to the params
                    params.libraries = body;

                    // Render the body for the libraries
                    return that.renderTemplate(req, res, params, 'nodes/find-a-library', 'find-a-library');
                }
            });
        });
    };

    /**
     * Function that renders the libraries detail template
     *
     * @param  {Request}   req    Request object
     * @param  {Response}  res    Response object
     */
    that.getLibraryDetail = exports.getLibraryDetail = function(req, res) {

        // Check if hostname is set in application locals
        server.setHostName(req);

        // Render the navigation template
        navigationController.getContent(req, res, function(err, navigation) {

            // Request options object
            var options = {
                'timeout': 5000,
                'url': 'http://' + req.headers.host + '/api/libraries/' + req.params.id
            };

            // Initialize some parameters to pass to the template body
            var params = {
                'currentNode': libutil.getCurrentNode(req),
                'partials': {
                    'navigation': navigation
                },
                'title': config.app.title
            };

            // Perform a request to the API
            request(options, function(error, result, body) {

                // If an error occured during the request, return a 500 error page
                if (error) {
                    log().error(error);

                    // Render the error page
                    return that.renderTemplate(req, res, params, 'errors/500', 'error-500');

                } else {

                    // Try parsing the response body
                    try {

                        // Parse the response body
                        body = JSON.parse(body);

                        // If an error occured during the request, return a 500 error page
                        if (body.error) {
                            log().error(body.error);

                            // Render the error page
                            return that.renderTemplate(req, res, params, 'errors/404', 'error-404');

                        } else {

                            // Add the library data to the parameters
                            params.data = body;

                            // Render the body for the libraries
                            return that.renderTemplate(req, res, params, 'nodes/library-profile', 'library-profile');
                        }

                    } catch (e) {
                        log().error(e);

                        // Render the error page
                        return that.renderTemplate(req, res, params, 'errors/500', 'error-500');
                    }
                }
            });
        });
    };
};

// Inherit from the BaseViewController
util.inherits(LibrariesController, BaseViewController);
