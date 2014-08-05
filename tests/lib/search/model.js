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

/**
 * A result model
 *
 * @param  {String}     queryString     The query string containing all the parameters to perform the request
 * @param  {String}     queryTime       The time needed to execute the query
 * @param  {Number}     numResults      The number of results
 * @param  {Object[]}   items           The returned items
 * @return {Result}                     Object representing an API result
 */
exports.Result = function(queryString, queryTime, numResults, items) {
    var that = {};
    that.queryString = queryString || null;
    that.queryTime = queryTime || 'n/a';
    that.numResults = parseInt(numResults, 10) || 0;
    that.items = items || [];
    return that;
};
