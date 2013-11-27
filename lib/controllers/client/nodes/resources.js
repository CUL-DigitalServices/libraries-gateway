var _ = require('underscore');
var request = require('request');

var config = require('../../../../config');
var util = require('../../../util/util');

var indexController = require('../index');
var navigationController = require('../partials/navigation');

/**
 * Function that renders the search node template
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

            // If extra parameters are specified in the request
            if (!_.isEmpty(req.query)) {

                // If the requested query parameter hasn't been specified
                if (!req.query.q) {

                    // Render the body for the resources
                    renderMainTemplate(req, res, params);

                // If the query parameter has been specified
                } else {

                    // Fetch the results from the API
                    getResourceResults(req.headers.host, req.query, function(error, results) {
                        if (error) {

                        }

                        console.log(results);

                        // Render the body for the resources
                        renderMainTemplate(req, res, params);
                    });
                }

            // If no parameters have been specified in the request
            } else {

                // Render the body for the resources
                renderMainTemplate(req, res, params);
            }
        }
    });
};

/**
 * Function that renders the resource detail template
 *
 * @param  {Request}   req    Request object
 * @param  {Response}  res    Response object
 */
var getResourceDetail = exports.getResourceDetail = function(req, res) {

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

            // Render the body for the resources
            res.render('nodes/resource-detail', params, function(err, html) {
                return indexController.getContent(req, res, 'resource-detail', html);
            });
        }
    });
};

/**
 * Function that fetches and displays the found resources
 * 
 * @param  {String}    host                The API host
 * @param  {Object}    query               Object containing all the parameters for the API request
 * @param  {Function}  callback            Standard callback function
 * @param  {Error}     callback.error      Error object to be send with the callback function
 * @param  {Results}   callback.results    Object containing the structured results from the API
 * @api private
 */
var getResourceResults = function(host, query, callback) {

    // Create a querystring from the given query object    
    var params = [];
    _.each(query, function(value, parameter) {
        params.push(parameter + "=" + value);
    });

    // Request options object
    var options = {
        'url': 'http://' + host + '/api/search?' + params.join('&')
    };

    // Do a request to the resources API
    request(options, function(error, response, body) {
        if (error) {
            return callback(error);
        }
        return callback(null, body);
    });
};

/**
 * Function that renders the main resource template
 *
 * @param  {Request}   req       Request object
 * @param  {Response}  res       Response object
 * @param  {Object}    params    Object containing parameters for the index template
 * @param  {String}    html      HTML dump of the partial that needs to be rendered
 * @api private
 */
var renderMainTemplate  = function(req, res, params, html) {

    // Render the find-a-resource template
    res.render('nodes/find-a-resource', params, function(err, html) {
        
        // When the find-a-resource template has been renderen, it is passed to the index template that will be rendered.
        return indexController.getContent(req, res, 'find-a-resource', html);
    });
};
