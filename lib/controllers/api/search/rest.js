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

var SearchAPI = require('./index');

/*!
 * Returns a collection of search results from LibrarySearch OR LibrarySearch+
 *
 * _GET_ `/api/search`
 *
 * @param  {Request}    req     The REST request object
 * @param  {Response}   res     The REST response object
 */
var getResults = exports.getResults = function(req, res) {

    // Check if a query was specified
    if (!req.query.q) {
        return res.send(400, 'No valid query given');
    }

    // Fetch the results
    SearchAPI.getResults(req.query, function(err, response) {
        if (err) {
            return res.send(err.code, err.msg);
        }

        return res.send(200, response);
    });
};

/*!
 * Returns a resource item by its ID
 *
 * _GET_ `/api/search/:api/:id`
 *
 * @param  {Request}    req     The REST request object
 * @param  {Response}   res     The REST response object
 */
var getResultById = exports.getResultById = function(req, res) {

    // Check if a valid API was specified
    if (!req.params.api) {
        return res.send(400, 'No valid API given');
    }

    // Check if an ID was specified
    if (!req.query.id) {
        return res.send(400, 'No valid ID given');
    }

    // Fetch the resource
    SearchAPI.getResultById(req.query, function(err, response) {
        if (err) {
            return res.send(err.code, err.msg);
        }

        return res.send(200, response);
    });
};


/*!
 * Returns all the facets for a set of results
 *
 * _GET_ `/api/search/facets`
 *
 * @param  {Request}    req     The REST request object
 * @param  {Response}   res     The REST response object
 */
var getFacetsForResults = exports.getFacetsForResults = function(req, res) {

    // Fetch the facets
    SearchAPI.getFacetsForResults(req.query, function(err, response) {
        if (err) {
            return res.send(err.code, err.msg);
        }

        return res.send(200, response);
    });
};
