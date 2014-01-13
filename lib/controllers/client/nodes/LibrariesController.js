var _ = require('underscore');
var request = require('request');
var util = require('util');

var config = require('../../../../config');

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

                try {

                    // Parse the response
                    libraries = JSON.parse(libraries);

                    // Check if the API returned an error
                    if (libraries.error) {
                        log().error(libraries.error);
                        return that.renderTemplate(req, res, null, 'errors/500', 'error-500');

                    } else {

                        // Create a data object
                        var data = {
                            'libraries': JSON.stringify(libraries),
                            'pageTitle': 'Find a library'
                        };

                        // Render the body for the libraries
                        return that.renderTemplate(req, res, data, 'nodes/find-a-library', 'find-a-library');
                    }

                } catch(error) {
                    log().error(error);
                    return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                }
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
        request(options, function(error, result, library) {
            if (error) {
                log().error(error);
                return that.renderTemplate(req, res, null, 'errors/500', 'error-500');

            } else {

                // Try parsing the response body
                try {

                    // Parse the response body
                    library = JSON.parse(library);

                    // If an error occured during the request, return an error page
                    if (library.error) {
                        log().error(library.error);
                        return that.renderTemplate(req, res, null, 'errors/500', 'error-500');

                    } else {

                        // Create a data object
                        var data = {
                            'library': library,
                            'pageTitle': library.name
                        };

                        // Render the body for the libraries
                        return that.renderTemplate(req, res, data, 'nodes/library-profile', 'library-profile');
                    }

                } catch(error) {
                    log().error(error);
                    return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                }
            }
        });
    };
};

// Inherit from the BaseViewController
return util.inherits(LibrariesController, BaseViewController);
