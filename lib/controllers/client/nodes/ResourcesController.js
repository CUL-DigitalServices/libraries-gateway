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

var config = require('../../../../config');
var log = require('../../../util/logger').logger();
var SearchAPI = require('../../api/search');

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
     * @param  {Request}    req     The REST request
     * @param  {Response}   res     The REST response
     */
    that.getContent = function(req, res) {

        // If extra parameters are specified in the request
        if (!_.isEmpty(req.query)) {

            // If the requested query parameter hasn't been specified
            if (!req.query.q) {

                // Parameters for the search template
                var opts = {
                    'query': req.query
                };

                // Render the search template; no additional parameters needed
                searchController.getContent(req, res, opts, function(err, tplSearch) {
                    if (err) {
                        log().error({'err': err}, 'Error while rendering searchController');
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

                // Make sure the API is able to handle the '&' character
                req.query.q = req.query.q.replace(/&/g, '%26');

                // Create a request options object
                var opts = _.clone(req.query);

                // Fetch the results from the API
                SearchAPI.getResults(opts, function(err, results) {
                    if (err) {
                        log().error({'err': err}, 'Error while fetching results');
                        return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                    }

                    try {

                        // Render an error page if the API returns an error
                        if (results.error) {
                            log().error({'err': results.error}, 'Error while fetching results');
                            return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                        }

                        // Parameters for the search template
                        var searchParams = {
                            'query': results.query
                        };

                        // Render the search template after the response has been received from the API
                        searchController.getContent(req, res, searchParams, function(err, tplSearch) {
                            if (err) {
                                log().error({'err': err}, 'Error while rendering searchController');
                                return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                            }

                            // Create a data object
                            var params = {
                                'api': null,
                                'partials': {
                                    'tplResults': {},
                                    'tplSearch': tplSearch
                                },
                                'search': results
                            };

                            // Cache the items
                            var items = results.results.items;

                            // Render the result items templates
                            var itemTemplate = 'partials/find-a-resource/api-results-aquabrowser';
                            if (results.results.api === 'summon') {
                                itemTemplate = 'partials/find-a-resource/api-results-summon';
                            }

                            // Cache the rendered templates
                            var templates = [];

                            /**
                             * Renders a template for each item in the results list
                             *
                             * @api private
                             */
                            var _renderItemTemplate = function() {

                                if (!items.length) {
                                    return _renderItemsTemplate();
                                }

                                var opts = {
                                    'api': results.results.api,
                                    'item': items.shift()
                                };

                                // Render the template
                                res.render(itemTemplate, opts, function(err, tplItem) {
                                    if (err) {
                                        log().error({'err': err}, 'Error while rendering results');
                                        return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                                    }

                                    // Add the rendered template to the collection
                                    templates.push(tplItem);

                                    // Iterate the process
                                    _renderItemTemplate();
                                });
                            };

                            /**
                             * Renders a template for the results list
                             *
                             * @api private
                             */
                            var _renderItemsTemplate = function() {

                                // Persist the generated templates
                                var templateParameters = _.clone(params);
                                templateParameters.search.results.items = templates;

                                // Render the results list template
                                res.render('partials/find-a-resource/api-results', templateParameters, function(err, tplResults) {
                                    if (err) {
                                        log().error({'err': err}, 'Error while rendering results');
                                        return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                                    }

                                    // Add the template to the parameters object
                                    params.partials.tplResults = tplResults;

                                    // Render the body for the resources
                                    return that.renderTemplate(req, res, params, 'nodes/find-a-resource-results', 'find-a-resource-results');
                                });
                            };

                            _renderItemTemplate();
                        });

                    } catch (err) {
                        log().error({'code': 500, 'msg': 'Error while fetching results', 'err': err});
                        return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                    }
                });
            }

        // If no parameters have been specified in the request
        } else {

            // Parameters for the search template
            var opts = {
                'query': null
            };

            // Render the search template after the response has been received from the API
            searchController.getContent(req, res, opts, function(err, tplSearch) {
                if (err) {
                    log().error({'err': err}, 'Error while rendering searchController');
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
     * @param  {Request}    req     The REST request
     * @param  {Response}   res     The REST response
     */
    that.getResourceDetail = function(req, res) {

        // Store the api and id parameters
        var api = req.params.api.toLowerCase();
        var id = req.params.id;

        // Check if a valid API and item ID have been specified
        if (api !== 'summon' && api !== 'aquabrowser' || !id) {
            log().error({'code': 400, 'msg': 'Invalid api/id specified'});
            return that.renderTemplate(req, res, null, 'errors/400', 'error-400');
        }

        // Fetch the results from the API
        var opts = {
            'api': api,
            'id': id
        };
        SearchAPI.getResultById(opts, function(err, results) {
            if (err) {
                log().error({'err': err}, 'Error while fetching resource detail');
                return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
            }

            try {

                // If the response body returns an error
                if (results.error) {
                    log().error({'err': 500, 'msg': results.error});
                    return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                }

                // If no resources were found
                if (Number(results.rowCount) === 0) {
                    return that.renderTemplate(req, res, null, 'errors/404', 'error-404');
                }

                // Create a data object
                var data = {
                    'api': api,
                    'pageTitle': 'Resource detail',
                    'resource': results.items[0],
                };

                // Generate the share text
                var title = 'Unknown';
                if (data.resource.titles) {
                    title = data.resource.titles.join(', ');
                }

                var authors = 'Unknown';
                if (data.resource.authors) {
                    var fullnames = _.pluck(data.resource.authors, 'fullname');
                    authors = fullnames.join(', ');
                }

                var shareUrl = config.server.protocol + '://' + config.server.host + ':' + config.server.port + '/find-a-resource/' + data.api + '/' + data.resource.id;
                var words = title.split(' ');
                if (words.length >= 10) {
                    // Cut the title off after the tenth word
                    title = words.slice(0, 10).join(' ') + '...';
                }

                data.shareText = 'I\'ve just found "'+ title +'" by '+ authors +' @libatcam. ' + shareUrl;
                data.shareUrl = shareUrl;

                // Define which template should be used (depending on the used API)
                var template = 'partials/resource-detail/aquabrowser';
                if (api === 'summon') {
                    template = 'partials/resource-detail/summon';
                }

                // Render the API specific template
                return that.renderTemplate(req, res, data, template, 'resource-detail');

            } catch (err) {
                log().error({'code': 500, 'msg': 'Error while fetching results', 'err': err});
                return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
            }
        });
    };

    /**
     * Function that returns all the facets for a query and displays them onto a separate page
     *
     * @param  {Request}    req     The REST request
     * @param  {Response}   res     The REST response
     */
    that.getFacetsForResults = function(req, res) {

        // Check if a valid query is set
        if (!req.query.api || !req.query.facet || !req.query.q) {
            return that.renderTemplate(req, res, null, 'errors/400', 'error-400');
        }

        // Collect the query parameters
        var queryParams = _.map(req.query, function(value, key) {
            return key + '=' + value;
        });

        // Create a data object
        var data = {
            'query': queryParams.join('&'),
            'pageTitle': 'Facets'
        };

        var opts = req.query;
        SearchAPI.getFacetsForResults(opts, function(err, results) {
            if (err) {
                log().error({'err': err}, 'Error while fetching facets for results');
                return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
            }

            try {

                // If the response body returns an error
                if (results.error) {
                    log().error({'err': results.error}, 'Error while fetching facets for results');
                    return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                }

                // Add the results to the data object
                data.results = _.filter(results, function(row) {
                    return row.rawLabel === opts.facet;
                });

                // Render the body for the facets overview
                return that.renderTemplate(req, res, data, 'nodes/find-a-resource-facets', 'resource-facets');

            // If an error occurred while parsing the results
            } catch (err) {
                log().error({'code': 500, 'msg': 'Error while fetching results', 'err': err});
                return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
            }
        });
    };
};

// Inherit from the BaseViewController
return util.inherits(ResourcesController, BaseViewController);
