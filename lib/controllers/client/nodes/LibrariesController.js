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
var request = require('request');
var util = require('util');

var BaseViewController = require('../BaseViewController').BaseViewController;
var config = require('../../../../config');
var log = require('lg-util/lib/logger').logger();

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

        // Request options object
        var options = {
            'timeout': 5000,
            'url': config.server.protocol + '://' + config.server.host + ':' + config.server.port + '/api/libraries'
        };

        // Perform a request to the API
        request(options, function(error, response, libraries) {
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
                        return that.renderTemplate(req, res, null, 'errors/' + response.statusCode, 'error-' + response.statusCode);

                    } else {

                        // Create a data object
                        var data = {
                            'alphabet': config.constants.alphabet,
                            'libraries': JSON.stringify(libraries),
                            'ranges': config.nodes['find-a-library'].settings.ranges
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

        // Request options object
        var options = {
            'timeout': 5000,
            'url': config.server.protocol + '://' + config.server.host + ':' + config.server.port + '/api/libraries/' + req.params.id
        };

        // Perform a request to the API
        request(options, function(error, response, library) {
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
                        return that.renderTemplate(req, res, null, 'errors/' + response.statusCode, 'error-' + response.statusCode);

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
