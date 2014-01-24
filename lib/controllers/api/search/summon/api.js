var _ = require('underscore');
var qs = require('querystring');
var request = require('request');

var config = require('../../../../../config');

var apiUtil = require('./util/util');
var log = require('../../../../util/logger').logger();
var search = require('../../../../util/search');

var FacetModel = require('../../../../models/search/facet');
var ResultModel = require('../../../../models/search/result');
var ResultsModel = require('../../../../models/search/results');

var ResourceModelFactory = require('../../../../factories/api/search/ResourceModelFactory');

/**
 * Function that returns the facets from Summon
 *
 * @param  {Object}       parameters          The query parameters
 * @param  {Function}     callback            The callback function
 * @param  {Error}        callback.error      The thrown error
 * @param  {Results}      callback.results    The created results model
 */
var getFacetsFromResults = module.exports.getFacetsFromResults = function(parameters, callback) {

    // The extra parameters to execute the search in the external API
    var extraParams = [];
    var isSummon = true;
    // Create a collection of facets
    var facetsCollection = ['s.ff=Language,or,1,100','s.ff=SubjectTerms,or,1,100','s.ff=ContentType,or,1,100'];
    // Predefine some queryString elements
    var queryString = ['s.ps=25', 's.dym=true', 's.debug=true', 's.ho=true'];
    queryString = queryString.concat(facetsCollection);
    // Construct the request options object
    var options = apiUtil.constructRequestOptions(null, isSummon, parameters, extraParams, queryString);

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
 * @param  {Boolean}      isSummon            Indicates if Summon has been specified explicitly
 * @param  {String}       parameters          The query parameters
 * @param  {Function}     callback            The callback function
 * @param  {Error}        callback.error      Error object to be send with the callback function
 * @param  {Results}      callback.results    The created results model
 */
var getResults = module.exports.getResults = function(isSummon, parameters, callback) {

    // Create a new array for the content specific parameters
    var extraParams = [];
    // Check if we're looking for a specific resource (ID)
    var isDetailRequest = _.has(parameters, 'id');
    // Create a collection of facets
    var facetsCollection = ['s.ff=Language,and,1,100','s.ff=SubjectTerms,and,1,100','s.ff=ContentType,and,1,100'];
    // Predefine some queryString elements
    var queryString = ['s.ps=25', 's.dym=true', 's.debug=true', 's.ho=true'];
    queryString = queryString.concat(facetsCollection);
    // Construct the request options ojbect
    var options = apiUtil.constructRequestOptions(null, isSummon, parameters, extraParams, queryString);

    // Do a request to the Summon API
    request(options, function(error, response, body) {

        // Initialize some parameters for the results model
        var recordCount = 0;
        var facets = [];
        var facetsOverview = [];
        var results = [];
        var pagination = [];
        var suggestions = null;

        // Create an empty results model in case the request fails
        var resultsModel = new ResultsModel.Results(recordCount, facets, facetsOverview, results, pagination, suggestions);

        // Return an error if the request fails
        if (error) {
            log().error(error);
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
                facetsOverview = (isSummon) ? search.createFacetOverview(parameters) : facetsOverview;
                results = _createResults(body, callback);
                pagination = _createPagination(body, parameters, callback);
                suggestions = _createSuggestions(body, parameters, callback);

                // Trim the facets down
                _.each(facets, function(facetType) {
                    facetType.facets = facetType.facets.slice(0, 5);
                });

                // Create a new results model
                resultsModel = new ResultsModel.Results(recordCount, facets, facetsOverview, results, pagination, suggestions);
                return callback(null, resultsModel);

            // When the parsing of the Summon result failed
            } catch(error) {
                log().error(error);
                return callback({'code': 500, 'msg': 'An error occurred while fetching Summon data'});
            }
        }
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
                var facetTypeLabel = facetTypeRawLabel = facetType.displayName;
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
                facets.push(new FacetModel.FacetType(facetTypeLabel, facetTypeRawLabel, facetTypeAmount, more, moreUrl, items));
            });
        }
    } catch(error) {
        log().error(error);
        return callback('An error occurred while fetching Summon data');
    }
    return facets;
};

/**
 * Function that creates a result collection
 *
 * @param  {Object}    body        The response body
 * @param  {Function}  callback    The callback function
 * @return {Results}               The Summon results
 * @api private
 */
var _createResults = function(body, callback) {

    // Instantiate a new variable for the result collection
    var results = [];

    // Loop the resources and create a new model for each resource
    if (body) {
        try {
            for (var i=0; i<body.documents.length; i++) {
                var item = body.documents[i];

                // ID
                if (!item['ID']) {
                    break;
                }

                // Create an object to store our model data
                var modelData = {
                    'id': apiUtil.getPropertyData(item, 'ID'),
                    'src': null,
                    'extId': null,
                    'titles': apiUtil.getPropertyData(item, 'Title'),
                    'description': null,
                    'isbn': apiUtil.getPropertyData(item, 'ISBN'),
                    'eisbn':  apiUtil.getPropertyData(item, 'EISBN'),
                    'issn': apiUtil.getPropertyData(item, 'ISSN'),
                    'ssid': apiUtil.getPropertyData(item, 'SSID'),
                    'authors': apiUtil.getResourceAuthors(item),
                    'published': apiUtil.getResourcePublicationData(item),
                    'subjects': apiUtil.getPropertyData(item, 'Discipline'),
                    'series': null,
                    'tags': null,
                    'notes': null,
                    'contentType': apiUtil.getPropertyData(item, 'ContentType'),
                    'thumbnails': null,
                    'links': apiUtil.getPropertyData(item, 'link'),
                    'branches': null
                };

                // Thumbnail
                if (item['thumbnail_s']) {
                    modelData.thumbnails = apiUtil.getPropertyData(item, 'thumbnail_s');
                } else if (item['thumbnail_m']) {
                    modelData.thumbnails = apiUtil.getPropertyData(item, 'thumbnail_m');
                } else if (item['thumbnail_l']) {
                    modelData.thumbnails = apiUtil.getPropertyData(item, 'thumbnail_l');
                }

                // Create a new model for each result
                var result = ResourceModelFactory.createResourceModel(modelData);
                results.push(result);
            }
        } catch(error) {
            log().error(error);
            return callback('An error occurred while fetching Summon data');
        }
    }
    return results;
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

    } catch(error) {
        log().error(error);
        return callback('An error occurred while fetching Summon data');
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

    } catch(error) {
        log().error(error);
        return callback('An error occurred while fetching Summon data');
    }
};
