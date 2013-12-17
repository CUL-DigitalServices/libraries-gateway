var _ = require('underscore');
var request = require('request');

var config = require('../../../../config');

var log = require('../../../util/logger').logger();
var server = require('../../../util/server');
var util = require('../../../util/util');

var indexController = require('../index');
var navigationController = require('../partials/navigation');

/**
 * Function that renders the libraries template
 *
 * @param  {Request}   req    Request object
 * @param  {Response}  res    Response object
 */
var getContent = exports.getContent = function(req, res) {

    // Check if hostname is set in application locals
    server.setHostName(req);

    // Render the navigation template
    navigationController.getContent(req, res, function(err, navigation) {
        if (err) {
            log().error(err);
            return res.send(500);
        }

        // Initialize some parameters to pass to the template body
        var params = {
            'currentNode': util.getCurrentNode(req),
            'partials': {
                'navigation': navigation
            },
            'title': config.app.title
        };

        // Render the body for the libraries
        res.render('nodes/find-a-library', params, function(err, html) {
            return indexController.getContent(req, res, 'find-a-library', html);
        });
    });
};

/**
 * Function that renders the libraries detail template
 *
 * @param  {Request}   req    Request object
 * @param  {Response}  res    Response object
 */
var getLibraryDetail = exports.getLibraryDetail = function(req, res) {

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
            'currentNode': util.getCurrentNode(req),
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
                res.render('errors/500', params, function(err, html) {
                    indexController.getContent(req, res, 'error-500', html);
                });
            } else {

                // Try parsing the response body
                try {

                    // Parse the response body
                    body = JSON.parse(body);

                    // If an error occured during the request, return a 500 error page
                    if (body.error) {

                        // Render the error page
                        res.render('errors/404', params, function(err, html) {
                            indexController.getContent(req, res, 'error-404', html);
                        });
                    } else {

                        // Add the library data to the parameters
                        params.data = body;

                        // Render the body for the libraries
                        res.render('nodes/library-profile', params, function(err, html) {
                            indexController.getContent(req, res, 'library-profile', html);
                        });
                    }

                } catch (e) {

                    // Render the error page
                    res.render('errors/500', params, function(err, html) {
                        indexController.getContent(req, res, 'error-500', html);
                    });
                }
            }
        });
    });
};
