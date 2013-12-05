var _ = require('underscore');
var request = require('request');

var config = require('../../../../config');
var util = require('../../../util/util');

var indexController = require('../index');
var navigationController = require('../partials/navigation');
var searchController = require('../partials/search');

/**
 * Function that renders the search node template
 *
 * @param  {Request}   req                 Request object
 * @param  {Response}  res                 Response object
 */
var getContent = exports.getContent = function(req, res) {

    // Render the navigation template
    navigationController.getContent(req, res, function(err, navigation) {

        // Render the search template
        searchController.getContent(req, res, function(err, search) {

            // Initialize some parameters to pass to the template body
            var params = {
                'currentNode': util.getCurrentNode(req),
                'partials': {
                    'navigation': navigation,
                    'search': search
                },
                'title': config.app.title
            };

            // If extra parameters are specified in the request
            if (!_.isEmpty(req.query)) {

                // If the requested query parameter hasn't been specified
                if (!req.query.q) {

                    // Render the body for the resources
                    return _renderTemplate(req, res, 'find-a-resource', 'nodes/find-a-resource', params);

                // If the query parameter has been specified
                } else {

                    // Create the request url
                    var reqParams = [];
                    _.each(req.query, function(value, parameter) {
                        reqParams.push(parameter + '=' + value);
                    });

                    var url = 'http://' + req.headers.host + '/api/search?' + reqParams.join('&');

                    // Fetch the results from the API
                    _getResourceResults(url, function(error, results) {
                        if (error || results.error) {
                            return _renderTemplate(req, res, 'error-500', 'errors/500', params);
                        }

                        // Render the body for the resources
                        return _renderTemplate(req, res, 'find-a-resource', 'nodes/find-a-resource-results', params);
                    });
                }

            // If no parameters have been specified in the request
            } else {

                // Render the body for the resources
                return _renderTemplate(req, res, 'find-a-resource', 'nodes/find-a-resource', params);
            }
        });
    });
};

/**
 * Function that renders the resource detail template
 *
 * @param  {Request}   req                 Request object
 * @param  {Response}  res                 Response object
 */
var getResourceDetail = exports.getResourceDetail = function(req, res) {

    // Render the navigation template
    navigationController.getContent(req, res, function(err, navigation) {

        // Initialize some parameters to pass to the template body
        var params = {
            'currentNode': util.getCurrentNode(req),
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
            return _renderTemplate(req, res, 'error-400', 'errors/400', params);
        }

        // Create the request url
        var url = 'http://' + req.headers.host + '/api/search/' + api + '?id=' + id;

        // Fetch the results from the API
        _getResourceResults(url, function(error, response) {

            // Parse the response from the API
            response = JSON.parse(response);

            if (error || response.error || response.results.data.error) {
                return _renderTemplate(req, res, 'error-500', 'errors/500', params);
            }

            // If the response returns an error
            if (Number(response.results.data.rowCount) === 0) {
                return _renderTemplate(req, res, 'error-404', 'errors/404', params);
            }

            // Add the results to the template parameters
            params.data = response.results.data.items[0];

            // Render the body for the resources
            return _renderTemplate(req, res, 'resource-detail', 'nodes/resource-detail', params);
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
            return callback(error);
        }
        return callback(null, body);
    });
};

/**
 * Function that renders a template before rendering the index template
 *
 * @param  {Request}   req                 Request object
 * @param  {Response}  res                 Response object
 * @param  {String}    id                  A unique identifier that will be added to the template
 * @param  {String}    template            The template that needs to be rendered
 * @param  {Object}    params              Object containing parameters for the index template
 * @api private
 */
var _renderTemplate = function(req, res, id, template, params) {

    // Render the given template before rendering the index template
    res.render(template, params, function(err, html) {
        return indexController.getContent(req, res, id, html);
    });
};
