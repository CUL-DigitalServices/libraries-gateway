var _ = require('underscore');
var request = require('request');
var util = require('util');

var config = require('../../../../config');

var libutil = require('../../../util/util');
var log = require('../../../util/logger').logger();
var server = require('../../../util/server');

var BaseViewController = require('../BaseViewController').BaseViewController;
var NavigationController = require('../partials/NavigationController').NavigationController;
var SearchController = require('../partials/SearchController').SearchController;

/**
 * Constructor
 */
var ResourcesController = module.exports.ResourcesController = function() {
    ResourcesController.super_.apply(this, arguments);
    var that = this;

    // Initialize controllers
    var navigationController = new NavigationController();
    var searchController = new SearchController();

    /**
     * Function that renders the search node template
     *
     * @param  {Request}   req                 Request object
     * @param  {Response}  res                 Response object
     */
    that.getContent = function(req, res) {

        // Check if hostname is set in application locals
        server.setHostName(req);

        // Render the navigation template
        navigationController.getContent(req, res, function(err, navigation) {

            // If extra parameters are specified in the request
            if (!_.isEmpty(req.query)) {

                // If the requested query parameter hasn't been specified
                if (!req.query.q) {

                    // Parameters for the search template
                    var searchParams = {
                        'query': req.query
                    };

                    // Render the search template; no additional parameters needed
                    searchController.getContent(req, res, searchParams, function(err, search) {

                        // Initialize some parameters to pass to the template body
                        var params = {
                            'currentNode': libutil.getCurrentNode(req),
                            'partials': {
                                'navigation': navigation,
                                'search': search
                            },
                            'title': config.app.title
                        };

                        // Render the body for the resources
                        return that.renderTemplate(req, res, params, 'nodes/find-a-resource', 'find-a-resource');
                    });

                // If the query parameter has been specified
                } else {

                    // Create the request url
                    var reqParams = [];
                    _.each(req.query, function(value, parameter) {
                        reqParams.push(parameter + '=' + value);
                    });

                    var url = 'http://' + req.headers.host + '/api/search?' + reqParams.join('&');

                    // Fetch the results from the API
                    _getResourceResults(url, function(error, response) {

                        // Parse the response from the API
                        response = JSON.parse(response);

                        // Parameters for the search template
                        var searchParams = {
                            'query': response.query
                        };

                        // Render the search template after the response has been received from the API
                        searchController.getContent(req, res, searchParams, function(err, search) {

                            // Initialize some parameters to pass to the template body
                            var params = {
                                'currentNode': libutil.getCurrentNode(req),
                                'partials': {
                                    'navigation': navigation,
                                    'search': search
                                },
                                'title': config.app.title
                            };

                            if (error || response.error) {
                                return that.renderTemplate(req, res, params, 'errors/500', 'error-500');
                            }

                            // Add the results to the template parameters
                            params.data = response;

                            // Render the body for the resources
                            return that.renderTemplate(req, res, params, 'nodes/find-a-resource-results', 'find-a-resource-results');
                        });
                    });
                }

            // If no parameters have been specified in the request
            } else {

                // Parameters for the search template
                var searchParams = {
                    'query': null
                };

                // Render the search template after the response has been received from the API
                searchController.getContent(req, res, searchParams, function(err, search) {

                    // Initialize some parameters to pass to the template body
                    var params = {
                        'currentNode': libutil.getCurrentNode(req),
                        'partials': {
                            'navigation': navigation,
                            'search': search
                        },
                        'title': config.app.title
                    };

                    // Render the body for the resources
                    return that.renderTemplate(req, res, params, 'nodes/find-a-resource', 'find-a-resource');
                });
            }
        });
    };

    /**
     * Function that renders the resource detail template
     *
     * @param  {Request}   req                 Request object
     * @param  {Response}  res                 Response object
     */
    that.getResourceDetail = exports.getResourceDetail = function(req, res) {

        // Check if hostname is set in application locals
        server.setHostName(req);

        // Render the navigation template
        navigationController.getContent(req, res, function(err, navigation) {

            // Initialize some parameters to pass to the template body
            var params = {
                'currentNode': libutil.getCurrentNode(req),
                'partials': {
                    'navigation': navigation
                },
                'title': config.app.title
            };

            // Store the api and id parameters
            var api = req.params.api.toLowerCase();
            var id = req.params.id;

            // Check if a valid API and item ID have been specified
            if (api !== 'summon' && api !== 'aquabrowser' || !id) {
                return that.renderTemplate(req, res, params, 'errors/400', 'error-400');
            }

            // Create the request url
            var url = 'http://' + req.headers.host + '/api/search/' + api + '?id=' + id;

            // Fetch the results from the API
            _getResourceResults(url, function(error, response) {
                if (error) {
                    log().error(error);
                }

                // Parse the response from the API
                response = JSON.parse(response);

                // Store the specified API
                var root = Object.keys(response.results)[0];

                if (error || response.error || response.results[root].error) {
                    log().error(arguments);
                    return that.renderTemplate(req, res, params, 'errors/500', 'error-500');
                }

                // If the response returns an error
                if (Number(response.results[root].rowCount) === 0) {
                    return that.renderTemplate(req, res, params, 'errors/404', 'error-404');
                }

                // Add the results to the template parameters
                params.api = api;
                params.data = response.results[root].items[0];

                // Render the body for the resources
                return that.renderTemplate(req, res, params, 'nodes/resource-detail', 'resource-detail');
            });
        });
    };

    /**
     * Function that fetches and displays the found resources
     *
     * @param  {String}    url                 The request url
     * @param  {Function}  callback            Standard callback function
     * @param  {Error}     callback.error      Error object to be send with the callback function
     * @param  {Results}   callback.results    Object containing the structured results from the API
     * @api private
     */
    var _getResourceResults = function(url, callback) {

        // Perform a request to the Search API
        request({'url': url}, function(error, response, body) {
            if (error) {
                log().error(error);
                return callback(error);
            }
            return callback(null, body);
        });
    };
};

// Inherit from the BaseViewController
util.inherits(ResourcesController, BaseViewController);
