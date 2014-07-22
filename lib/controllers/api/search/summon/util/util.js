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
var crypto = require('crypto');
var querystring = require('querystring');

var config = require('../../../../../../config');
var libUtil = require('../../../../../util/util');
var log = require('../../../../../util/logger').logger();
var ResultModel = require('../../../../../models/search/result');
var searchUtil = require('../../../../../util/search');

////////////////////////
//  PUBLIC FUNCTIONS  //
////////////////////////

/**
 * Function that constructs the request url
 *
 * @param  {String}     uri             The request uri (e.g. http://search.lib.cam.ac.uk/RefinePanel.ashx)
 * @param  {Object}     parameters      The query parameters (e.g. id, branch...)
 * @param  {Array}      extraParams     Extra API bound request parameters (e.g. output...)
 * @return {Object}     queryString     Request options object
 */
var constructRequestOptions = module.exports.constructRequestOptions = function(uri, parameters, extraParams, queryString) {

    // Check if a querystring is set
    if (parameters) {

        // Check if an ID is specified
        // e.g.: 'FETCH-credo_entries_128572990'
        if (parameters['id']) {
            queryString.push('s.fids=' + parameters['id']);

        } else {

            // Check if the keyword has been set
            if (parameters['q']) {
                extraParams.push(parameters['q']);
            }

            // Summon additional search parameters

            // Check if the current page is set (e.g. 2)
            if (parameters['page']) {
                queryString.push('s.pn=' + parameters['page']);
            }

            // These parameters influence the way of searching through resources

            // Check if the format is set
            if (parameters['contenttype']) {
                try {
                    format = parameters['contenttype'];
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

    // Create the header object that will be sent to the Summon API
    var headers = {
        'Accept': 'application/json',
        'x-summon-date': _getUTCDate(),
        'Host': config.constants.engines.summon.uri,
        'Version': config.constants.engines.summon.version
    };

    // Contstruct the query parameter string
    extraParams = 's.q=' + encodeURIComponent(extraParams.join('&'));
    queryString.push(extraParams);

    queryString = queryString.sort().join('&');
    queryString = decodeURIComponent(queryString);

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

    // Return the options
    return options;
};

/**
 * Function that creates an overview of all the selected facets and their values
 *
 * @param  {Object}     parameters      The query parameters
 * @return {Array}                      The returned facetsOverview collection
 */
var createFacetOverview = module.exports.createFacetOverview = function(parameters) {
    var overview = [];
    var toIgnore = ['api', 'facet', 'id', 'page', 'q'];
    _.each(parameters, function(value, key) {
        if (_.indexOf(toIgnore, key) < 0) {
            var url = querystring.stringify(_.omit(parameters, key));
            if (!(key === 'format' && value === 'all')) {
                overview.push({'label': value, 'url': url});
            }
        }
    });
    return overview;
};

/**
 * Function that fetches all the authors from a resource
 *
 * @param  {Array}  item    The item data
 * @return {Array}          The value of the requested item property
 */
var getResourceAuthors = module.exports.getResourceAuthors = function(item) {
    try {
        var authors = [];
        _.each(item['Author_xml'], function(row) {
            if (row.fullname) {
                authors.push(new ResultModel.Author(row.fullname));
            }
        });
        if (authors && !authors.length) authors = null;
        return authors;
    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that fetches the resource publication data
 *
 * @param  {Object}           item       The item data
 * @return {PublicationData}             The created PublicationData model
 */
var getResourcePublicationData = module.exports.getResourcePublicationData = function(item) {
    try {

        // Date
        var day = null;
        var month = null;
        var year = null;

        if (item['PublicationDate_xml'] && item['PublicationDate_xml'][0]) {
            if (item['PublicationDate_xml'][0]['day']) {
                day = item['PublicationDate_xml'][0]['day'];
            }
            if (item['PublicationDate_xml'][0]['month']) {
                month = item['PublicationDate_xml'][0]['month'];
            }
            if (item['PublicationDate_xml'][0]['year']) {
                year = item['PublicationDate_xml'][0]['year'];
            }
        }

        var lblDate = _.compact([day, month, year]).join('-');
        var publicationDate = new ResultModel.PublicationDate(day, month, year, lblDate);

        var publicationTitle = null;
        if (item['PublicationTitle'] && item['PublicationTitle'][0]) {
            publicationTitle = libUtil.putInArrayIfNotNull(libUtil.consolidateValue(item['PublicationTitle']));
        }

        var publicationVolume = null;
        if (item['Volume']) {
            publicationVolume = libUtil.putInArrayIfNotNull(libUtil.consolidateValue(item['Volume']));
        }

        var publicationIssue = null;
        if (item['Issue']) {
            publicationIssue = libUtil.putInArrayIfNotNull(libUtil.consolidateValue(item['Issue']));
        }

        // Pages
        var startPage = null;
        if (item['StartPage'] && item['StartPage'][0]) {
            startPage = libUtil.consolidateValue(item['StartPage'][0]);
        }

        var endPage = null;
        if (item['EndPage'] && item['EndPage'][0]) {
            startPage = libUtil.consolidateValue(item['EndPage'][0]);
        }

        var lblPage = _.compact([startPage, endPage]).join('-');
        var publicationPage = new ResultModel.PublicationPage(startPage, endPage, lblPage);

        // Create a new publication data model
        var publicationData = new ResultModel.PublicationData(publicationTitle, publicationDate, publicationVolume, publicationIssue, publicationPage);
        return publicationData;

    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that picks the data for a specific property out of a record
 *
 * @param  {Array}  item    The item data
 * @return {Array}          The value of the requested item property
 */
var getPropertyData = module.exports.getPropertyData = function(item, key) {
    try {
        var value = null;
        if (item[key]) {
            value = _cleanUpValue(item[key]);
            if (!_.isArray(item[key])) {
                return [value];
            }
        }
        return value;
    } catch(error) {
        log().error(error);
        return null;
    }
};

//////////////////////////
//  INTERNAL FUNCTIONS  //
//////////////////////////

/**
 * Strips the value down to a simple string
 *
 * @param  {String}  value    The value thad needs to be stripped
 * @return {String}           The cleaned up value
 */
var _cleanUpValue = function(value) {
    if (value) {
        if (_.isArray(value)) {
            return _.map(value, function(item) { return item.replace(/<\/?h>/g,'') });
        }
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
};

/**
 * Returns a date in UTC format
 *
 * @return {Date}          The date in a UTC format
 * @api private
 */
var _getUTCDate = function() {
    var d = new Date();
    return d.toUTCString();
};
