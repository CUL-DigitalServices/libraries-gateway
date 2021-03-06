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
var qs = require('querystring');
var request = require('request');

var config = require('../../../../../config');
var log = require('lg-util/lib/logger').logger();
var search = require('../../../../util/search');
var FacetModel = require('../../../../models/search/facet');
var ResultModel = require('../../../../models/search/result');
var ResultsModel = require('../../../../models/search/results');
var ResourceModelFactory = require('../../../../factories/api/search/ResourceModelFactory');

var SummonUtil = require('./util/util');

////////////////////////
//  PUBLIC FUNCTIONS  //
////////////////////////

/**
 * Function that returns the facets from Summon
 *
 * @param  {Object}       parameters          The query parameters
 * @param  {Function}     callback            The callback function
 * @param  {Error}        callback.error      The thrown error
 * @param  {Results}      callback.results    The created results model
 */
var getFacetsFromResults = module.exports.getFacetsFromResults = function(parameters, callback) {

    // Create a collection of facets
    var facetsCollection = ['s.ff=Language,or,1,100','s.ff=SubjectTerms,or,1,100','s.ff=ContentType,or,1,100'];

    // Predefine some queryString elements
    var queryString = ['s.ps=25', 's.dym=true', 's.debug=true', 's.ho=true'];
    queryString = queryString.concat(facetsCollection);

    // Construct the request options object
    var options = SummonUtil.constructRequestOptions(parameters, queryString);

    // Do a request to the Summon API
    request(options, function(error, response, body) {

        // Parse the response body
        body = JSON.parse(body);

        // Return the generated facets
        return callback(null, _createFacets(body, parameters));
    });
};

/**
 * Function that returns the results from Summon
 *
 * @see http://api.summon.serialssolutions.com
 * @see https://github.com/summon/Summon.php/blob/master/SerialsSolutions/Summon/Base.php
 *
 * @param  {String}     parameters          The query parameters
 * @param  {Function}   callback            The callback function
 * @param  {Error}      callback.error      Error object to be send with the callback function
 * @param  {Results}    callback.results    The created results model
 */
var getResults = module.exports.getResults = function(parameters, callback) {

    // Check if we're looking for a specific resource (ID)
    var isDetailRequest = _.has(parameters, 'id');

    // Create a collection of facets
    var facetsCollection = ['s.ff=ContentType,and,1,100','s.ff=Language,and,1,100','s.ff=SubjectTerms,and,1,100'];

    // Predefine some queryString elements
    var queryString = ['s.ps=25', 's.dym=true', 's.debug=false', 's.ho=true'];
    queryString = queryString.concat(facetsCollection);

    // Construct the query string
    queryString = SummonUtil.constructRequestQueryString(parameters, queryString);

    // Execute the Summon query
    _executeQuery(queryString, function(err, response) {

        // Initialize some parameters for the results model
        var recordCount = 0;
        var facets = [];
        var filters = [];
        var results = [];
        var pagination = [];
        var suggestions = null;

        // Create an empty results model in case the request fails
        var resultsModel = new ResultsModel.Results(recordCount, facets, filters, results, pagination, suggestions);

        // Return an error if the request fails
        if (err) {
            log().error(err);
            return callback({'code': 500, 'msg': 'An error occurred while fetching Summon data'});

        // Since Summon doesn't seem to be able to handle strange characters in the query parameters, a 401 error is thrown.
        // We still want to display the results object.
        } else if (response.statusCode === 401) {
            return callback(null, resultsModel);

        } else {

            try {

                // Parse the response body
                body = JSON.parse(response.body);

                // If an error is thrown from the Summon API
                if (body.errors) {

                    // Since Summon requires the ID to start with 'FETCH-', we don't want this to result in
                    // a 500 error because no matching resources are found. We catch this error and return it as a 404.
                    if (isDetailRequest && body.errors[0].code === 'user.entered.query.is.malformed') {

                        // Put all the individual result models into a containing results model
                        return callback(null, resultsModel);
                    }

                    // If an other error is thrown by Summon
                    log().error(body.errors);
                    return callback({'code': 500, 'msg': 'An error occurred while fetching Summon data'});
                }

                recordCount = body.recordCount;
                facets = _createFacets(body, parameters, callback);
                filters = SummonUtil.createFacetOverview(parameters);
                results = body.documents;
                pagination = _createPagination(body, parameters, callback);
                suggestions = _createSuggestions(body, parameters, callback);

                // Trim the facets down
                _.each(facets, function(facetType) {
                    facetType.facets = facetType.facets.slice(0, 5);
                });

                // Create a new results model
                resultsModel = new ResultsModel.Results(recordCount, facets, filters, results, pagination, suggestions);
                return callback(null, resultsModel);

            // When the parsing of the Summon result failed
            } catch(err) {
                log().error(err);
                return callback({'code': 500, 'msg': 'An error occurred while fetching Summon data'});
            }
        }
    });
};

/**
 * Function that fetches the results from the Summon API using a raw query
 *
 * @param  {String}     queryString     A raw querystring
 * @param  {Function}   callback        Standard callback function
 */
var getResultsByRawQuery = exports.getResultsByRawQuery = function(queryString, callback) {

    // Execute the Summon query
    _executeQuery(queryString, function(err, response) {
        if (err) {
            return callback(err);
        }

        // Return the response
        return callback(null, response);
    });
};

//////////////////////////
//  INTERNAL FUNCTIONS  //
//////////////////////////

/**
 * Function that executes an Summon query and fetches the results from the API
 *
 * @param  {String}     queryString         The queryString that needs to be appended to the API uri
 * @param  {Function}   callback            Standard callback function
 * @param  {Error}      callback.error      Object containing the error code and the error message
 * @param  {Object}     callback.response   Object containing the results returned from the Summon API
 * @api private
 */
var _executeQuery = function(queryString, callback) {

    // Construct the request options object
    var options = SummonUtil.constructRequestOptions(queryString);

    // Do a request to the Summon API
    request(options, function(err, response, body) {
        if (err) {
            log().error({'code': 400, 'msg': err}, 'An error occurred while requesting Summon data');
            return callback({'code': 400, 'msg': 'An error occurred while requesting Summon data'});
        }

        // Return the response from the Summon API
        return callback(null, response);
    });
};

/**
 * Function that creates a facet collection
 *
 * @param  {Object}   body          The response body
 * @param  {Object}   parameters    The query parameters
 * @return {Facet[]}                Collection of facets
 * @api private
 */
var _createFacets = function(body, parameters, callback) {

    // Duplicate the parameters object
    var params = _.clone(parameters);

    // Initialize a new variable for the facets
    var facets = [];

    // Loop all the facet records from the response body
    try {
        if (body.facetFields) {

            _.each(body.facetFields, function(facetType) {

                // Pick all the necessary properties from the facetType
                var facetTypeRawLabel = facetType.displayName;
                var facetTypeAmount = facetType.counts.length;
                var more = facetTypeAmount > 5 ? (facetTypeAmount - 5) : 0;
                var moreUrl = search.createFacetMoreUrl(params, facetTypeRawLabel);

                var items = [];
                _.each(facetType.counts, function(facet) {

                    // Create a new model for each facet
                    var facetLabel = facet.value;
                    var facetAmount = facet.count;
                    var url = search.createFacetUrl(params, facetTypeRawLabel, facetLabel);

                    var facetModel = new FacetModel.Facet(facetLabel, facetAmount, url);
                    items.push(facetModel);
                });

                // Add the facet type to the collection
                facets.push(new FacetModel.FacetType(facetTypeRawLabel, facetTypeRawLabel, facetTypeAmount, more, moreUrl, items));
            });
        }
    } catch (err) {
        log().error({'code': 500, 'msg': 'An error occurred while fetching Summon data', 'err': err});
        return callback({'code': 500, 'msg': 'An error occurred while fetching Summon data'});
    }
    return facets;
};

/**
 * Function that creates the pagination object for Summon
 *
 * @param  {Object}    body          The response body
 * @param  {Object}    parameters    The query parameters
 * @param  {Function}  callback      The callback function
 * @api private
 */
var _createPagination = function(body, parameters, callback) {

    // Instantiate a new variable for the pagination
    var pagination = null;

    try {

        // Initialize some variables
        var pageNumber = 0;
        var pageCount = 0;
        var firstPage = 0;
        var lastPage = 0;

        // Since we don't want to have changes in our original query object, we need to clone the parameters
        var params = _.clone(parameters);
        params.api = 'summon';

        // If the query produced results
        if (body && body.recordCount) {

            pageNumber = parseInt(body.query.pageNumber, 10);
            var pageCount = parseInt(body.pageCount, 10);

            // Since Summon only supports 50 pages of results, we need to trash all the pages that come after page 50
            // (will return 'page.number.too.large' error otherwise)
            if (pageCount > config.nodes['find-a-resource'].settings.pageLimit) pageCount = config.nodes['find-a-resource'].settings.pageLimit;

            var firstPage = 1;
            var lastPage = parseInt(pageCount, 10);
        }

        // Create a new pagination model
        pagination = search.createPaginationModel(params, pageNumber, pageCount, firstPage, lastPage);

    } catch (err) {
        log().error({'code': 500, 'msg': 'An error occurred while fetching Summon data', 'err': err});
        return callback({'code': 500, 'msg': 'An error occurred while fetching Summon data'});
    }
    return pagination;
};

/**
 * Function that creates a suggestions object
 *
 * @param  {Object}       body          The response body
 * @param  {Object}       parameters    The query parameters
 * @param  {Function}     callback      The callback function
 * @return {Suggestions}                The created suggestions object
 * @api private
 */
var _createSuggestions = function(body, parameters, callback) {

    // Initialize a new variable for the suggestions
    var suggestions = null;

    // Initialize some variables
    var originalQuery = parameters.q;
    var suggestedItems = [];

    // Loop all the suggestions from the response body
    try {

        // If the body contains suggestions
        if (body.didYouMeanSuggestions) {

            // Clone the parameters
            var params = _.clone(parameters);

            // Check if the object exists
            if (body.didYouMeanSuggestions.length) {

                // Pick the original entered query
                if (body.didYouMeanSuggestions[0]['originalQuery']) {
                    originalQuery = body.didYouMeanSuggestions[0]['originalQuery'];
                }

                // Loop the suggestions results
                _.each(body.didYouMeanSuggestions, function(suggestion) {
                    if (suggestion.suggestedQuery) {

                        // Replace the existing query in the parameters query
                        params.q = suggestion.suggestedQuery;

                        var label = params.q;
                        var url = qs.stringify(params);

                        // Create a new suggestion model
                        var suggestionModel = new ResultsModel.Suggestion(label, url);
                        suggestedItems.push(suggestionModel);
                    }
                });

                // Create a new suggestions model
                suggestions = new ResultsModel.Suggestions(originalQuery, suggestedItems);
            }
        }

        // Return the suggestions
        return suggestions

    } catch (err) {
        log().error({'code': 500, 'msg': 'An error occurred while fetching Summon data', 'err': err});
        return callback({'code': 500, 'msg': 'An error occurred while fetching Summon data'});
    }
};
