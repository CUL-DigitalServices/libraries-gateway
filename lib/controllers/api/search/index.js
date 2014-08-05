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

var config = require('../../../../config');
var log = require('lg-util/lib/logger').logger();

var AquabrowserAPI = require('./aquabrowser/api');
var SummonAPI = require('./summon/api');

////////////////////////
//  PUBLIC FUNCTIONS  //
////////////////////////

/**
 * Function that fetches the results from an external API.
 *
 * @param  {Object}     query                   The query object containing search parameters
 * @param  {String}     query.q                 The query (e.g. 'darwin')
 * @param  {String}     [query.api]             The api (e.g. "aquabrowser"). Optional, default `aquabrowser`
 * @param  {String}     [query.contenttype]     The resource's format (Summon)
 * @param  {String}     [query.format]          The resource's format (Aquabrowser)
 * @param  {String}     [query.language]        The resource language
 * @param  {String}     [query.subjectterms]    The resource subjectterms (e.g. 'evolution', 'article'). (Summon)
 * @param  {Function}   callback                Standard callback function
 * @param  {Error}      callback.err            Object containing the error code and the error message
 * @param  {Result[]}   callback.results        Collection of search results
 */
var getResults = exports.getResults = function(query, callback) {

    // Create the request query object
    var opts = _.clone(query);

    // Default the API to Aquabrowser if no API has been specified
    if (!opts.api || opts.api !== 'summon') {
        opts.api = 'aquabrowser';
    }

    // Sanitize the request options
    opts = _sanitizeQuery(opts);

    /**
     * Internal function that represents a callback for each engine
     *
     * @param  {Object}     err         Object containing the error code and error message
     * @param  {Object}     results     Object containing the results from the API
     * @api private
     */
    var _resultsCallback = function(err, results) {
        if (err) {
            log().error({'err': err});
            return callback(err);
        }

        // Unescape the query properties
        _.each(opts, function(value, key) {
            try {
                opts[key] = decodeURIComponent(value);

            } catch (err) {
                log().error(err);
                opts[key] = value;
            }
        });

        // Replace the ampersands by the HTML entity
        if (opts.q) {
            opts.q = opts.q.replace(/&/g, '%26');
        }

        // Return the results
        return callback(null, {'results': results, 'query': opts});
    };

    // Get the results from the correct API
    var getResultsFunc = opts.api === 'aquabrowser' ? AquabrowserAPI.getResults : SummonAPI.getResults;
    getResultsFunc(opts, function(err, results) {
        if (err) {
            log().error(err);
            return _resultsCallback(err);
        }

        // Since different templates are used for each api/format/... we need to return the used api with the results
        results.api = opts.api;

        // Return the results
        return _resultsCallback(null, results);
    });
};

/**
 * Function that returns a collection of search results from LibrarySearch OR LibrarySearch+
 *
 * @param  {Object}     opts                Object containing search parameters
 * @param  {String}     opts.api            The api (e.g. "aquabrowser")
 * @param  {String}     opts.id             The resource ID
 * @param  {Function}   callback            Standard callback function
 * @param  {Error}      callback.err        Object containing the error code and the error message
 * @param  {Result}     callback.results    Object representing a resource
 */
var getResultById = exports.getResultById = function(opts, callback) {

    // Sanitize the query
    opts = _sanitizeQuery(opts);

    // Keep track of the specified API
    var isAquabrowser = (opts.api === 'aquabrowser');
    var isSummon = (opts.api === 'summon');

    // In case the engine doesn't exist, we return an error
    if (!isAquabrowser && !isSummon) {
        return callback({'code': 400, 'msg': 'Invalid API'});
    }

    // Get the results from the correct API
    var getResultsFunc = opts.api === 'aquabrowser' ? AquabrowserAPI.getResults : SummonAPI.getResults;
    getResultsFunc(opts, function(err, results) {
        if (err) {
            log().error({'err': err});
            return callback(err);
        }
        return callback(null, results);
    });
};

/**
 * Function that returns a collection of facets from LibrarySearch OR LibrarySearch+
 *
 * @param  {Object}     opts                Object containing search parameters
 * @param  {String}     opts.api            The api (e.g. "aquabrowser")
 * @param  {String}     opts.facet          The facet (e.g. "format")
 * @param  {String}     opts.q              The query (e.g. "darwin")
 * @param  {Function}   callback            Standard callback function
 * @param  {Error}      callback.err        Object containing the error code and the error message
 * @param  {Result}     callback.results    Object representing a resource
 */
var getFacetsForResults = exports.getFacetsForResults = function(opts, callback) {

    // Sanitize the query
    opts = _sanitizeQuery(opts);

    // Check if a valid query is set
    if (!opts.api) {
        return callback({'code': 400, 'msg': 'Invalid API'});
    } else if (!opts.facet) {
        return callback({'code': 400, 'msg': 'Invalid facet'});
    } else if (!opts.q) {
        return callback({'code': 400, 'msg': 'Invalid query'});
    }

    // Fetch the facets from the specified API
    try {

        // Keep track of the specified API
        var isAquabrowser = (opts.api === 'aquabrowser');
        var isSummon = (opts.api === 'summon');

        /**
         * Callback function when facets are retrieved from the specified API
         *
         * @param  {Error}      err         The thrown error
         * @param  {Object}     results     Object containing the facets
         */
        var _parseFacets = function(err, results) {
            if (err) {
                log().error({'err': err});
                return callback({'code': 500, 'msg': 'Error while fetching facets'});
            }

            // Return the facets
            return callback(null, results);
        };

        // Determine which API should be addressed
        if (isAquabrowser) {
            AquabrowserAPI.getFacetsFromResults(opts, _parseFacets);
        } else if (isSummon) {
            SummonAPI.getFacetsFromResults(opts, _parseFacets);
        }

    } catch (err) {
        log().error({'err': err});
        return callback({'code': 500, 'msg': 'Error while fetching facets'});
    }
};

//////////////////////////
//  INTERNAL FUNCTIONS  //
//////////////////////////

/**
 * Function that sanitizes the query
 *
 * @param  {Object}     query       Object containing all the query parameters
 * @return {Object}                 Object containing all the sanitized query parameters
 * @api private
 */
var _sanitizeQuery = function(query) {

    // Make sure only valid parameters are entered in the querystring
    _.each(query, function(value, key) {

        // First check if the parameter is valid
        var allowedKeys = config.nodes['find-a-resource'].settings.parameters;
        if (allowedKeys.indexOf(key) < 0) {
            delete query[key];
        }
    });

    // Make sure the api is always casted to lowercase characters
    if (query.api) {
        query.api = query.api.toLowerCase();
    }

    // If a page is set, make sure it is numeric, not a decimal and not negative
    if (query.page) {
        query.page = parseInt(query.page, 10);
        if (isNaN(query.page) || query.page < 1) {
            query.page = 1;
        } else if (query.page > config.nodes['find-a-resource'].settings.pageLimit) {
            query.page = config.nodes['find-a-resource'].settings.pageLimit;
        }
    }

    // Return the sanitized query
    return query;
};
