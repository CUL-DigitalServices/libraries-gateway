var _ = require('underscore');
var request = require('request');
var util = require('util');

var config = require('../../../../config');

var libutil = require('../../../util/util');
var log = require('../../../util/logger').logger();
var server = require('../../../util/server');

var BaseViewController = require('../BaseViewController').BaseViewController;

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

        // Request options object
        var options = {
            'timeout': 5000,
            'url': 'http://' + req.headers.host + '/api/libraries'
        };

        // Perform a request to the API
        request(options, function(error, result, libraries) {
            if (error) {
                log().error(error);
                return that.renderTemplate(req, res, null, 'errors/500', 'error-500');

            } else {

                // Create a data object
                var data = {
                    'libraries': libraries
                };

                // Render the body for the libraries
                return that.renderTemplate(req, res, data, 'nodes/find-a-library', 'find-a-library');
            }
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

        // Request options object
        var options = {
            'timeout': 5000,
            'url': 'http://' + req.headers.host + '/api/libraries/' + req.params.id
        };

        // Perform a request to the API
        request(options, function(error, result, body) {
            if (error) {
                log().error(error);
                return that.renderTemplate(req, res, null, 'errors/500', 'error-500');

            } else {

                // Try parsing the response body
                try {

                    // Parse the response body
                    body = JSON.parse(body);

                    // If an error occured during the request, return a 500 error page
                    if (body.error) {
                        log().error(body.error);
                        return that.renderTemplate(req, res, null, 'errors/404', 'error-404');

                    } else {

                        // Create a data object
                        var data = {
                            'library': body,
                            'pageTitle': body.name
                        };

                        // Render the body for the libraries
                        return that.renderTemplate(req, res, data, 'nodes/library-profile', 'library-profile');
                    }

                } catch (e) {
                    log().error(e);
                    return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                }
            }
        });
    };
};

// Inherit from the BaseViewController
return util.inherits(LibrariesController, BaseViewController);
