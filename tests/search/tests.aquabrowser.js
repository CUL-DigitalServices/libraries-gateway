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

var AquabrowserAPI = require('../../lib/controllers/api/search/aquabrowser/api');

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
            return deferred.reject(err);
        }

        // Store the number of results found
        var numResults = 0;

        // Only pluck the results if the 'standard' object was set
        if (results.root.feedbacks.standard) {
            numResults = results.root.feedbacks.standard.resultcount;
        }

        // Pluck the results from the rhow esponse
        var items = getItemsFromResults(results.root.results);

        // Return the results for the Aquabrowser API request
        deferred.resolve(new Result(queryString, null, numResults, items));
    });

    // Return a promise
    return deferred.promise;
};

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

        // Loop the records
        _.each(results.record, function(_record) {

            // Create a new record object
            var item = {};

            // Get the title
            item.title = null;
            if (_record.d && _record.d[0]) {
                if (_record.d[0]['df245'] && _record.d[0]['df245']['df245']) {
                    var title = [];
                    _.each(_record.d[0]['df245']['df245'], function(key) {
                        if (key.key === 'a') {
                            if (key['exact']) {
                                title.push(key['exact']);
                            }
                            if (key['_']) {
                                title.push(key['_']);
                            }
                        } else if (key.key === 'b') {
                            title.push(key['_']);
                        } else if (key.key === 'c') {
                            title.push(key['_']);
                        }
                    });
                    if (title.length) {
                        title = title.join(' ');
                    }
                    item.title = title;
                }
            }

            // Add the record to the items collection
            items.push(item);
        });
    }

    // Return the items
    return items;
};
