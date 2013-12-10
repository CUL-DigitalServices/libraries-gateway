var _ = require('underscore');
var crypto = require('crypto');
var request = require('request');

var config = require('../../../../config');
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
 * @param  {String}     parameters          Query parameters
 * @param  {Function}   callback            The callback function
 * @param  {Error}      callback.error      Error object to be send with the callback function
 * @param  {Results[]}  callback.results    Collection of results to be send with the callback function
 */
var getResults = module.exports.getResults = function(parameters, callback) {

    // Check if we're looking for a specific resource (ID)
    var isDetailRequest = false;

    // Create a new array for the query parameters
    // s.ff: Return all the facets
    var queryString = ['s.ff=ContentType,or,,','s.ps=10'];

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
                queryString.push('s.q=' + parameters['q']);
            }

            // Check if the format is set
            if (parameters['format'] && parameters['format'] !== 'all') {
                var format = config.constants.formats[parameters['format']]['summon'];
                queryString.push('s.fvf=ContentType,' + format + ',false');
            }

            // Check if the current page is set
            // Set a limit of 50 pages for Summon
            if (parameters['page']) {
                // Since we don't allow decimals, we ceil the page number
                var page = Math.ceil(parameters['page']);
                if (page > 50) page = 50;
                queryString.push('s.pn=' + page);
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

    queryString = queryString.sort();
    queryString = queryString.join('&');
    try {
        queryString = decodeURIComponent(queryString);
    } catch(err) {
        return callback('Invalid query given');
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
    request(options, function(err, res, body) {
        if (err) {
            return callback('An error occurred while fetching Summon data');

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
                        var results = new ResultsModel.Results(0, [], []);
                        return callback(null, results);
                    }

                    // If an other error is thrown by Summon
                    return callback('An error occurred while fetching Summon data');
                }

                // Variable to store all the results from Summon
                var summonResults = [];

                // Facets
                var facets = [];
                if (body.facetFields.length) {
                    facets = body.facetFields[0].counts;
                }

                // Loop the resources and create a new model for each resource
                for (var i=0; i<body.documents.length; i++) {
                    var item = body.documents[i];

                    // ID
                    if (!item['ID']) {
                        return callback('An error occurred while parsing Summon data');
                    }

                    var id = _getPropertyData(item, 'ID');
                    var title = _getPropertyData(item, 'Title');
                    var isbn = _getPropertyData(item, 'ISBN');
                    var eisbn = _getPropertyData(item, 'EISBN');
                    var issn = _getPropertyData(item, 'ISSN');
                    var ssid = _getPropertyData(item, 'SSID');
                    var author = _getPropertyData(item, 'Author');
                    var date = _getPropertyData(item, 'PublicationDate');
                    var contentType = _getPropertyData(item, 'ContentType');

                    // Thumbnail
                    var thumbnail = null;
                    if (item['thumbnail_s']) {
                        thumbnail = _getPropertyData(item, 'thumbnail_s');
                    }
                    if (item['thumbnail_m']) {
                        thumbnail = _getPropertyData(item, 'thumbnail_m');
                    }
                    if (item['thumbnail_l']) {
                        thumbnail = _getPropertyData(item, 'thumbnail_l');
                    }

                    // Create a new model for each result
                    var result = new ResultModel.Result(id, title, isbn, eisbn, issn, ssid, author, date, contentType, thumbnail);
                    summonResults.push(result);
                }

                // Create a pagination model
                try {
                    var pagination = null;

                    // If the query produced results
                    if (body.recordCount) {

                        var pageNumber = parseInt(body.query.pageNumber, 10);
                        var pageCount = parseInt(body.pageCount, 10);

                        // Since Summon only supports 50 pages of results, we need to trash all the pages that come after page 50
                        // (will return 'page.number.too.large' error otherwise)
                        if (pageCount > 50) pageCount = 50;

                        var firstPage = 1;
                        var lastPage = parseInt(pageCount, 10);

                        pagination = search.createPaginationModel(parameters, pageNumber, pageCount, firstPage, lastPage);
                    }

                } catch(e) {
                    return callback('An error occurred while fetching Summon data');
                }

                // Put all the individual result models into a containing results model
                var results = new ResultsModel.Results(body.recordCount, facets, summonResults, pagination);
                return callback(null, results);

            // When the parsing of the Summon result failed
            } catch (e) {
                return callback('An error occurred while fetching Summon data');
            }
        }
    });
};

/**
 * Function that picks the data for a specific property out of a record
 *
 * @param  {Array}      item                The item data
 * @return {String}                         The value of the requested item property
 * @api private
 */
var _getPropertyData = function(item, key) {
    var value = null;
    if (item[key] && item[key][0]) {
        value = _cleanUpValue(item[key][0]);
    }
    return value;
};

/**
 * Converts the header object to a string, needed for the Summon authentication
 *
 * @param  {Object}     header              Object containing all the header information
 * @return {String}                         String that will be used as a hash for the authentication
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
 * @param  {Date}       date                The date in a CEST format
 * @return {Date}                           The date in a GMT format
 * @api private
 */
var _convertDate = function(date) {
    var d = date;
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    var offset = 0;
    return new Date(utc + (3600000 * offset)).toUTCString();
};

/**
 * Strips the value down to a simple string
 *
 * @param  {String}     value               The value thad needs to be stripped
 * @return {String}                         The cleaned up value
 * @api private
 */
var _cleanUpValue = function(value) {
    if (value) {
        return value.replace(/<h>/g,'').replace(/<\/h>/g,'');
    }
    return null;
};
