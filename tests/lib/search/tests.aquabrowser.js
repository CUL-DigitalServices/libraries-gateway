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
var q = require('q');

var AquabrowserAPI = require('../../../lib/controllers/api/search/aquabrowser/api');
var log = require('lg-util/lib/logger').logger();

var Result = require('./model').Result;

/**
 * Function that plucks the desired data from the Aquabrowser results
 *
 * @param  {String}     queryString         The query string containing all the parameters to perform the request
 */
var getTestResultData = module.exports.getTestResultData = function(queryString) {
    var deferred = q.defer();

    // Request the results using a raw query
    AquabrowserAPI.getResultsByRawQuery(queryString, function(err, results) {
        if (err) {
            return deferred.reject({'queryString': queryString, 'err': {'code': 500, 'msg': 'Error while executing Aquabrowser query'}});
        }

        // Store the number of results found
        var numResults = 0;

        // Only pluck the results if the 'standard' object was set
        if (results.root.feedbacks.standard) {
            numResults = results.root.feedbacks.standard.resultcount;
        }

        // Pluck the results from the rhow esponse
        var items = getItemsFromResults(results.root.results);

        // Since Aquabrowser doesn't allow us to limit the number of results, we're doing it ourselves
        items = items.slice(0,5);

        // Return the results for the Aquabrowser API request
        deferred.resolve(new Result(queryString, null, numResults, items));
    });

    // Return a promise
    return deferred.promise;
};

//////////////////////////
//  INTERNAL FUNCTIONS  //
//////////////////////////

/**
 * Returns the items from the Aquabrowser results
 *
 * @param  {Object}     results     Object containing the response data
 * @return {Object[]}               Collection of item objects
 * @api private
 */
var getItemsFromResults = function(results) {

    // Create a new variable to store the items
    var items = [];

    // Check if items are available
    if (results.record) {

        // Since Aquabrowser doesn't return an array if only one item was found, we create one ourselves
        if (!_.isArray(results.record)) {
            results.record = [ results.record ];
        }

        // Loop the records
        _.each(results.record, function(_record) {

            // Create a new record object
            var item = {
                'title': null,
                'url': null,
                'authors': null,
                'contenttype': null
            };

            if (_record.d && _record.d[0]) {
                item.title = getTitleFromRecord(_record.d[0]);
                item.url = getUrlFromRecord(_record.d[0]);
                item.authors = getAuthorsFromRecord(_record.d[0]);
            }

            // Get the record's content type
            if (_record.fields && _record.fields[0]) {
                item.contenttype = getContentTypeFromRecord(_record.fields[0]);
            }

            // Add the record to the items collection
            items.push(item);
        });
    }

    // Return the items
    return items;
};

/**
 * Function that plucks the record's authors
 *
 * @param  {Object}     record      Object containing record data
 * @return {String}                 The record's authors
 * @api private
 */
var getAuthorsFromRecord = function(record) {
    var authors = null;
    if (record['df100'] && record['df100']['df100']) {
        authors = [];
        _.each(record['df100']['df100'], function(key) {
            if (key.key === 'a') {
                if (key['_']) {
                    authors.push(key['_']);
                }
            } else if (key.key === 'd') {
                authors.push(key['_']);
            }
        });
        if (authors.length) {
            authors = authors.join(' ');
        }
    }
    return authors;
};

/**
 * Function that plucks the record's title
 *
 * @param  {Object}     record      Object containing record data
 * @return {String}                 The record's title
 * @api private
 */
var getTitleFromRecord = function(record) {
    var title = null;
    if (record['df245'] && record['df245']['df245']) {
        title = [];
        _.each(record['df245']['df245'], function(key) {
            if (key.key === 'a') {
                if (key['_']) {
                    title.push(key['_']);
                }
            } else if (key.key === 'b') {
                title.push(key['_']);
            } else if (key.key === 'c') {
                title.push(key['_']);
            } else if (key.key === 'h') {
                title.push(key['_']);
            }
        });
        if (title.length) {
            title = title.join(' ');
        }
    }
    return title;
};

/**
 * Function that plubs the record's external url
 *
 * @param  {Object}     record      Object containing record data
 * @return {String}                 The record's url
 * @api private
 */
var getUrlFromRecord = function(record) {
    var url = null;
    if (record['df856'] && record['df856']['df856']) {
        _.each(record['df856']['df856'], function(key) {
            if (key.key === 'u') {
                url = key['_'];
            }
        });
    }
    return url;
};

/**
 * Function that plucks the record's content type
 *
 * @param  {Object}     record      Object containing record data
 * @return {String}                 The record's content type
 * @api private
 */
var getContentTypeFromRecord = function(record) {
    var contenttype = null;
    if (record['material_t']) {
        contenttype = record['material_t'];
        if (_.isArray(contenttype)) {
            contenttype = contenttype.join(', ');
        }
    }
    return contenttype;
};
