var request = require('request');

var config = require('../../../../config');
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

    // Render the navigation template
    navigationController.getContent(req, res, function(err, navigation) {
        if (!err) {

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
        }
    });
};

/**
 * Function that renders the libraries detail template
 *
 * @param  {Request}   req    Request object
 * @param  {Response}  res    Response object
 */
var getLibraryDetail = exports.getLibraryDetail = function(req, res) {

    // Render the navigation template
    navigationController.getContent(req, res, function(err, navigation) {

        // Request options object
        var options = {
            'url': 'http://' + req.headers.host + '/api/libraries/' + req.params.id
        };

        // Get the library information from the API
        request(options, function(error, result, body) {

            // Parse the returned body
            body = JSON.parse(body);

            // Initialize some parameters to pass to the template body
            var params = {
                'currentNode': util.getCurrentNode(req),
                'data': body,
                'partials': {
                    'navigation': navigation
                },
                'title': config.app.title
            };

            // If an error occured during the request, return a 500 error page
            if (error) {
                // Render the body for the libraries
                res.render('partials/500', params, function(err, html) {
                    return indexController.getContent(req, res, 'error-500', html);
                });
            }

            // Render the body for the libraries
            res.render('nodes/library-profile', params, function(err, html) {
                return indexController.getContent(req, res, 'library-profile', html);
            });
        });
    });
};
