var _ = require('underscore');
var request = require('request');
var util = require('util');

var config = require('../../../../config');

var log = require('../../../util/logger').logger();

var BaseViewController = require('../BaseViewController').BaseViewController;
var SearchController = require('../partials/SearchController').SearchController;

/**
 * Constructor
 */
var ResourcesController = module.exports.ResourcesController = function() {
    ResourcesController.super_.apply(this, arguments);
    var that = this;

    // Initialize controllers
    var searchController = new SearchController();

    /**
     * Function that renders the search node template
     *
     * @param  {Request}   req                 Request object
     * @param  {Response}  res                 Response object
     */
    that.getContent = function(req, res) {

        // If extra parameters are specified in the request
        if (!_.isEmpty(req.query)) {

            // If the requested query parameter hasn't been specified
            if (!req.query.q) {

                // Parameters for the search template
                var searchParams = {
                    'query': req.query
                };

                // Render the search template; no additional parameters needed
                searchController.getContent(req, res, searchParams, function(error, tplSearch) {
                    if (error) {
                        log().error(error);
                        return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                    }

                    // Create a data object
                    var data = {
                        'tplSearch': tplSearch
                    };

                    // Render the body for the resources
                    return that.renderTemplate(req, res, data, 'nodes/find-a-resource', 'find-a-resource');
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
                    if (error) {
                        log().error(error);
                        return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                    }

                    try {

                        // Parse the response from the API
                        response = JSON.parse(response);

                        // Render an error page if the API returns an error
                        if (response.error) {
                            log().error(response.error);
                            return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                        }

                        // Parameters for the search template
                        var searchParams = {
                            'query': response.query
                        };

                        // Render the search template after the response has been received from the API
                        searchController.getContent(req, res, searchParams, function(error, tplSearch) {
                            if (error) {
                                log().error(error);
                                return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                            }

                            // Create a data object
                            var params = {
                                'api': null,
                                'partials': {
                                    'results': {},
                                    'tplSearch': tplSearch
                                },
                                'search': response
                            };

                            // Render the Aquabrowser template
                            params.api = 'aquabrowser';
                            res.render('partials/api-results', params, function(error, tplAquabrowser) {
                                if (error) {
                                    log().error(error);
                                    return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                                }

                                // Add the template to the parameters object
                                params.partials.results.aquabrowser = tplAquabrowser;

                                // Render the Summon template
                                params.api = 'summon';
                                res.render('partials/api-results', params, function(error, tplSummon) {
                                    if (error) {
                                        log().error(error);
                                        return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                                    }

                                    // Add the template to the parameters object
                                    params.partials.results.summon = tplSummon;

                                    // Render the body for the resources
                                    return that.renderTemplate(req, res, params, 'nodes/find-a-resource-results', 'find-a-resource-results');
                                });
                            });
                        });

                    } catch(error) {
                        log().error(error);
                        return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                    }
                });
            }

        // If no parameters have been specified in the request
        } else {

            // Parameters for the search template
            var searchParams = {
                'query': null
            };

            // Render the search template after the response has been received from the API
            searchController.getContent(req, res, searchParams, function(error, tplSearch) {
                if (error) {
                    log().error(error);
                    return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                }

                // Create a data object
                var data = {
                    'tplSearch': tplSearch
                };

                // Render the body for the resources
                return that.renderTemplate(req, res, data, 'nodes/find-a-resource', 'find-a-resource');
            });
        }
    };

    /**
     * Function that renders the resource detail template
     *
     * @param  {Request}   req                 Request object
     * @param  {Response}  res                 Response object
     */
    that.getResourceDetail = exports.getResourceDetail = function(req, res) {

        // Store the api and id parameters
        var api = req.params.api.toLowerCase();
        var id = req.params.id;

        // Check if a valid API and item ID have been specified
        if (api !== 'summon' && api !== 'aquabrowser' || !id) {
            log().error('Invalid api/id specified');
            return that.renderTemplate(req, res, null, 'errors/400', 'error-400');
        }

        // Create the request url
        var url = 'http://' + req.headers.host + '/api/search/' + api + '?id=' + id;

        // Fetch the results from the API
        _getResourceResults(url, function(error, response) {
            if (error) {
                log().error(error);
                return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
            }

            try {

                // Parse the response from the API
                response = JSON.parse(response);

                // Store the specified API
                var root = Object.keys(response.results)[0];

                // If the response returns an error
                if (response.error) {
                    log().error(response.error);
                    return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                }

                // If the response returns an error
                if (response.results[root].error) {
                    log().error(response.results[root].error);
                    return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                }

                // If no resources were found
                if (Number(response.results[root].rowCount) === 0) {
                    return that.renderTemplate(req, res, null, 'errors/404', 'error-404');
                }

                // Create a data object
                var data = {
                    'api': api,
                    'pageTitle': response.results[root].items[0].title[0],
                    'resource': response.results[root].items[0],
                };

                // Generate the share text
                var title = data.resource.title.join(', ');
                var authors = data.resource.author.join(', ');
                var shareUrl = req.header('host') + '/find-a-resource/' + data.api + '/' + data.resource.id;
                var words = title.split(' ');
                if (words.length >= 10) {
                    // Cut the title off after the tenth word
                    title = words.slice(0, 10).join(' ') + '...';
                }

                data.shareText = 'I\'ve just found "'+ title +'" by '+ authors +' @libatcam. ' + shareUrl;
                data.shareUrl = shareUrl;

                // Render the body for the resources
                return that.renderTemplate(req, res, data, 'nodes/resource-detail', 'resource-detail');

            } catch(error) {
                log().error(error);
                return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
            }
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
return util.inherits(ResourcesController, BaseViewController);
