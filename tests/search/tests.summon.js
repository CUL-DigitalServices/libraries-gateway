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

var SummonAPI = require('../../lib/controllers/api/search/summon/api');

var Result = require('./model').Result;

/**
 * Function that plucks the desired data from the Summon results
 *
 * @param  {String}     queryString         The query string containing all the parameters to perform the request
 */
var getTestResultData = module.exports.getTestResultData = function(queryString) {
    var deferred = q.defer();

    // Request the results using a raw query
    SummonAPI.getResultsByRawQuery(queryString, function(err, response) {
        if (err) {
            deferred.reject(err);
        }

        try {

            // Parse the response body
            body = JSON.parse(response.body);

            // Store the number of results found
            var numResults = body.recordCount;

            // Store the matching resources
            var items = getItemsFromResults(body.documents);

            // Resolve the promise by returning the Summon results
            deferred.resolve(new Result(queryString, null, numResults, items));

        } catch(err) {

            // Reject the promise if an error occurred
            deferred.reject({'code': 500, 'msg': err});
        }
    });

    // Return a promise
    return deferred.promise;
};

/**
 * Returns the items from the Summon results
 *
 * @param  {Object}     records     Object containing the response data
 * @return {Object[]}               Collection of item objects
 * @api private
 */
var getItemsFromResults = function(records) {

    // Create a new variable to store the items
    var items = [];

    // Check if items are available
    if (records.length) {

        // Loop the records
        _.each(records, function(_record) {

            // Create a new item object
            var item = {
                'title': stripValue(_record.Title)
            };

            // Add the item to the items collection
            items.push(item);
        });
    }

    // Return the items
    return items;
};

/**
 * Removes the tags from a value and takes it out of an array
 *
 * @param  {Object}     value       The record property
 * @return {String}                 The record property as a string without tags
 */
var stripValue = function(value) {

    // Take the value out of the array
    if (_.isArray(value)) {
        value = value[0];
    }

    // Remove the tags from the value
    value = value.replace(/<\/?h>/g,'');

    // Return the stripped value
    return value;
};
