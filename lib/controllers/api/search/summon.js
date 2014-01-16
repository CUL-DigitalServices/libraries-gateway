var _ = require('underscore');
var crypto = require('crypto');
var qs = require('querystring');
var request = require('request');

var config = require('../../../../config');

var log = require('../../../util/logger').logger();
var search = require('../../../util/search');

var FacetModel = require('../../../models/search/facet');
var ResultModel = require('../../../models/search/result');
var ResultsModel = require('../../../models/search/results');

/**
 * Function that returns the results from Summon
 *
 * @see http://api.summon.serialssolutions.com
 * @see https://github.com/summon/Summon.php/blob/master/SerialsSolutions/Summon/Base.php
 *
 * @param  {Boolean}      isSummon            Indicates if Summon has been specified explicitly
 * @param  {String}       parameters          Query parameters
 * @param  {Function}     callback            The callback function
 * @param  {Error}        callback.error      Error object to be send with the callback function
 * @param  {Results}      callback.results    The created results model
 */
var getResults = module.exports.getResults = function(isSummon, parameters, callback) {

    // Check if we're looking for a specific resource (ID)
    var isDetailRequest = false;

    // Create a new array for the content specific parameters
    var extraParams = [];

    // Create a new array for the global parameters
    // s.ff: Return all the facets
    var facetsCollection = ['s.ff=Language,and,1,5','s.ff=SubjectTerms,and,1,5','s.ff=ContentType,and,1,5'];
    var queryString = ['s.ps=25', 's.dym=true', 's.debug=true', 's.ho=true'];
    var queryString = queryString.concat(facetsCollection);

    // Check if a querystring is set
    if (parameters) {

        // Check if an ID is specified
        // e.g.: 'FETCH-credo_entries_128572990' (Summon)
        //       '2098311' (Aquabrowser)
        if (parameters['id']) {
            isDetailRequest = true;
            queryString.push('s.fids=' + parameters['id']);

        } else {

            // Check if the keyword has been set
            if (parameters['q']) {
                extraParams.push(parameters['q']);
            }

            // Parameters which can only be added if the API is specified in the UI (facets)
            if (isSummon) {

                // Summon additional search parameters

                // Check if the current page is set (e.g. 2)
                if (parameters['page']) {
                    queryString.push('s.pn=' + parameters['page']);
                }

                // These parameters influence the way of searching through resources

                // Check if the format is set
                if (parameters['format'] && parameters['format'] !== 'all') {
                    try {
                        format = parameters['format'];
                    } catch(error) {
                        log().error(error);
                        return callback('Invalid format specified');
                    }
                    queryString.push('s.fvf=ContentType,' + format + ',false');
                }

                // Check if the language is set (e.g. Spanish, English, German...)
                if (parameters['language']) {
                    queryString.push('s.fvf=Language,' + parameters['language'] + ',false');
                }

                // Check if the subject terms are set (e.g. electronic books, evolution...)
                if (parameters['subjectterms']) {
                    queryString.push('s.fvf=SubjectTerms,' + parameters['subjectterms'] + ',false');
                }
            }
        }
    }

    // Create the header object that will be sent to the Summon API
    var headers = {
        'Accept': 'application/json',
        'x-summon-date': _convertDate(new Date()),
        'Host': config.constants.engines.summon.uri,
        'Version': config.constants.engines.summon.version
    };

    // Contstruct the query parameter string
    extraParams = 's.q=' + encodeURIComponent(extraParams.join('&'));
    queryString.push(extraParams);

    queryString = queryString.sort().join('&');
    try {
        queryString = decodeURIComponent(queryString);

    // If decoding the querystring failed, return an empty result object
    } catch(error) {
        log().error(error);
        var pagination = _createPagination(null, parameters);
        return callback(null, new ResultsModel.Results(0, [], [], pagination));
    }

    // Convert the header to a string to create a hash afterwards
    var headerString = _constructHeaderString(headers) + queryString + '\n';

    // Create a hash from the application key and the headerString
    var sha1Digest = crypto.createHmac('sha1', config.secret.summon.auth.key).update(headerString).digest('base64');

    // Construct the header authentication string
    var authHeaderString = 'Summon ' + config.secret.summon.auth.id + ';' + sha1Digest;
    headers['Authorization'] = authHeaderString;

    // Construct the request url
    var url = 'http://' + headers['Host'] + headers['Version'] + '?' + queryString;

    // Create an options object that can be submitted to the Summon API
    var options = {
        'method': 'GET',
        'url': url,
        'timeout': config.constants.engines.summon.timeout,
        'headers': headers
    };

    // Perform the request to the Summon API
    request(options, function(error, res, body) {

        // Initialize some parameters for the results model
        var recordCount = 0;
        var facets = [];
        var facetsOverview = [];
        var results = [];
        var pagination = [];
        var suggestions = [];

        // Create an empty results model in case the request fails
        var resultsModel = new ResultsModel.Results(recordCount, facets, facetsOverview, results, pagination, suggestions);

        // Return an error if the request fails
        if (error) {
            log().error(error);
            return callback('An error occurred while fetching Summon data');

        // Since Summon doesn't seem to be able to handle strange characters in the query parameters, a 401 error is thrown.
        // We still want to display the results object.
        } else if (res.statusCode === 401) {
            return callback(null, resultsModel);

        } else {

            // Try parsing the JSON string as an object
            try {

                body = JSON.parse(res.body);

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
                    return callback('An error occurred while fetching Summon data');
                }

                recordCount = body.recordCount;
                facets = _createFacets(body, parameters, callback);
                facetsOverview = (isSummon) ? search.createFacetOverview(parameters) : facetsOverview;
                results = _createResults(body, callback);
                pagination = _createPagination(body, parameters, callback);
                suggestions = _createSuggestions(body, parameters, callback);

                // Create a new results model
                resultsModel = new ResultsModel.Results(recordCount, facets, facetsOverview, results, pagination, suggestions);
                return callback(null, resultsModel);

            // When the parsing of the Summon result failed
            } catch(error) {
                log().error(error);
                return callback('An error occurred while fetching Summon data');
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
                var facetTypeLabel = facetType.displayName;
                var facetTypeAmount = facetType.pageSize;

                var items = [];
                _.each(facetType.counts, function(facet) {

                    // Create a new model for each facet
                    var facetLabel = facet.value;
                    var facetAmount = facet.count;
                    var url = search.createFacetUrl(params, facetTypeLabel, facetLabel);

                    var facetModel = new FacetModel.Facet(facetLabel, facetAmount, url);
                    items.push(facetModel);
                });

                // Add the facet type to the collection
                facets.push(new FacetModel.FacetType(facetTypeLabel, facetTypeAmount, items));
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

                console.log('\n\n\n');
                console.log(item);

                var id = _getPropertyData(item, 'ID');
                var src = null;
                var extId = null;
                var title = _getPropertyData(item, 'Title');
                var isbn = _getPropertyData(item, 'ISBN');
                var eisbn = _getPropertyData(item, 'EISBN');
                var issn = _getPropertyData(item, 'ISSN');
                var ssid = _getPropertyData(item, 'SSID');
                var author = _getPropertyData(item, 'Author');
                var date = _getPropertyData(item, 'PublicationDate');
                var subject = null;
                var physicalDescription = null;
                var series = null;
                var note = null;
                var contentType = _getPropertyData(item, 'ContentType');
                var link = _getPropertyData(item, 'link');

                // Thumbnail
                var thumbnail = null;
                if (item['thumbnail_s']) {
                    thumbnail = _getPropertyData(item, 'thumbnail_s');
                } else if (item['thumbnail_m']) {
                    thumbnail = _getPropertyData(item, 'thumbnail_m');
                } else if (item['thumbnail_l']) {
                    thumbnail = _getPropertyData(item, 'thumbnail_l');
                }

                // Create a new model for each result
                var result = new ResultModel.Result(id, src, extId, title, isbn, eisbn, issn, ssid, author, date, subject, physicalDescription, series, note, contentType, thumbnail, link);
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
            }

            // Create a new suggestions model
            suggestions = new ResultsModel.Suggestions(originalQuery, suggestedItems);

        }
    } catch(error) {
        log().error(error);
        return callback('An error occurred while fetching Summon data');
    }
    return suggestions;
};

/**
 * Strips the value down to a simple string
 *
 * @param  {String}  value    The value thad needs to be stripped
 * @return {String}           The cleaned up value
 * @api private
 */
var _cleanUpValue = function(value) {
    if (value) {
        return value.replace(/<\/?h>/g,'');
    }
    return null;
};

/**
 * Converts the header object to a string, needed for the Summon authentication
 *
 * @param  {Object}  header    Object containing all the header information
 * @return {String}            String that will be used as a hash for the authentication
 * @api private
 */
var _constructHeaderString = function(header) {
    var headerString = '';
    _.each(header, function(value, key) {
        headerString += value + '\n';
    });
    return headerString;
}

/**
 * Converts the date to the correct GMT
 *
 * @param  {Date}  date    The date in a CEST format
 * @return {Date}          The date in a GMT format
 * @api private
 */
var _convertDate = function(date) {
    var d = date;
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    var offset = 0;
    return new Date(utc + (3600000 * offset)).toUTCString();
};

/**
 * Function that picks the data for a specific property out of a record
 *
 * @param  {Array}  item    The item data
 * @return {Array}          The value of the requested item property
 * @api private
 */
var _getPropertyData = function(item, key) {
    var value = null;
    if (item[key] && item[key][0]) {
        if (_.isArray(item[key])) {
            value = [_cleanUpValue(item[key][0])];
        } else {
            value = [_cleanUpValue(item[key])];
        }
    }
    return value;
};
