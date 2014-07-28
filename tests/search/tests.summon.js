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

var SummonAPI = require('../../lib/controllers/api/search/summon/api');

var Result = require('./model').Result;

/**
 * Function that plucks the desired data from the Summon results
 *
 * @param  {String}     queryString         The query string containing all the parameters to perform the request
 * @param  {Function}   callback            Standard callback function
 * @param  {Error}      callback.err        Object containing the error code and error message
 * @param  {Object}     callback.results    Collection of matching items returned by Summon
 */
var getTestResultData = module.exports.getTestResultData = function(queryString, callback) {

    // Request the results using a raw query
    SummonAPI.getResultsByRawQuery(queryString, function(err, response) {
        if (err) {
            return callback(err);
        }

        // Parse the response body
        body = JSON.parse(response.body);

        // Store the number of results found
        var numResults = body.recordCount;

        // Return the results for the Summon API request
        return callback(null, new Result(numResults));
    });
};
