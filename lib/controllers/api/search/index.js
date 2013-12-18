var _ = require('underscore');

var config = require('../../../../config');
var log = require('../../../util/logger').logger();

var AquabrowserAPI = require('./aquabrowser');
var SummonAPI = require('./summon');

/**
 * @swagger
 * resourcePath: /search
 * description: Search endpoints
 */



/**
 * @swagger
 * models:
 *   SearchResult:
 *     id: SearchResult
 *     type: Object
 *     properties:
 *       id:
 *         type: String
 *       title:
 *         type: String
 *       author:
 *         type: String
 *       date:
 *         type: String
 *       link:
 *         type: String
 *       contentType:
 *         type: String
 *       publicationDate:
 *         type: String
 *       branch:
 *         type: String
 */

// TODO: Split getResults and add the JSDoc in the appriorate place

/**
 * @swagger
 * path: /search
 * operations:
 *   -  httpMethod: GET
 *      summary: Search through multiple resource indexes
 *      responseClass: SearchResult
 *      nickname: searchCombined
 *      notes: This API allows you to perform a combined search in AquaBrowser (librarysearch) and Summon (librarysearch+).<br />The results for each index will be returned as separate entities, no attempt at merging the resultsets will be made.
 *      parameters:
 *        - name: q
 *          description: The term(s) you wish to search on
 *          paramType: query
 *          required: true
 *          type: string
 *        - name: page
 *          description: Allows for paging. Note that this has an upper-limit of 40
 *          paramType: query
 *          required: false
 *          type: string
 *        - name: author
 *          description: Filter the results based on the author
 *          paramType: query
 *          required: false
 *          type: string
 *        - name: format
 *          description: Filter the results based on the format of the result
 *          paramType: query
 *          enum: [ books, ebooks, ejournals, manuscripts, journals, paper ]
 *          required: false
 *          type: string
 *      responseMessages:
 *        - code: 400
 *          message: Invalid parameter supplied
 */

/**
 * @swagger
 * path: /search/{index}
 * operations:
 *   -  httpMethod: GET
 *      summary: Search in a specific index
 *      responseClass: SearchResults
 *      nickname: searchInIndex
 *      notes: This API allows you to perform a search in either AquaBrowser (librarysearch) or Summon (librarysearch+).
 *      parameters:
 *        - name: index
 *          description: The index you wish to search through
 *          paramType: path
 *          required: true
 *          type: string
 *          enum: [ aquabrowser, summon ]
 *        - name: q
 *          description: The term(s) you wish to search on
 *          paramType: query
 *          required: true
 *          type: string
 *        - name: page
 *          description: Allows for paging. Note that this has an upper-limit of 40
 *          paramType: query
 *          required: false
 *          type: string
 *        - name: author
 *          description: Filter the results based on the author
 *          paramType: query
 *          required: false
 *          type: string
 *        - name: format
 *          description: Filter the results based on the format of the result
 *          paramType: query
 *          enum: [ books, ebooks, ejournals, manuscripts, journals, paper ]
 *          required: false
 *          type: string
 *      responseMessages:
 *        - code: 400
 *          message: Invalid parameter supplied
 */
/**
 * Function that returns a collection of search results from LibrarySearch AND LibrarySearch+
 *
 * @param  {Request}   req    Request
 * @param  {Response}  res    Response
 */
var getCombinedResults = exports.getCombinedResults = function(req, res) {

    // Check if a query or ID was specified
    if (!req.query.q && !req.query.id) {
        return res.send(400, {'error': 'No valid query or ID given'});
    }

    // Sanitize the query
    var query = _sanitizeQuery(req.query);

    // Keep track of the specified API
    var isAquabrowser = false;
    var isSummon = false;

    // Check if an API has been specified
    if (query.api) {
        isAquabrowser = (query.api === 'aquabrowser');
        isSummon = (query.api === 'summon');
    }

    // Store how many external API's have been called, since we do async requests
    var searchToComplete = Object.keys(config.constants.engines).length;
    var searchComplete = 0;

    // Create an object to store the search results
    var results = {
        'aquabrowser': {},
        'summon': {}
    };

    /**
     * Internal function that represents a callback for each engine
     * Each time the function is triggered, we check if the amount of searches that need to be completed is reached
     * Only when the completed searches are equal to the 'searches to complete', we return the results
     *
     * @param  {String}  engine      The engine that is used to perform the search
     * @param  {Object}  query       Object containing all the query parameters
     * @param  {Object}  response    Object containing the response from the API
     * @api private
     */
    var _resultsCallback = function(engine, query, response) {

        // Increase our temporary variable when results are retrieved
        searchComplete++;

        // Add the retrieved results to the main object
        results[engine] = response;

        // Unescape the query properties
        _.each(query, function(value, key) {

            try {

                // Transform the strings to lowercase characters
                key = String(key).toLowerCase();
                value = String(value).toLowerCase();

                try {
                    query[key] = decodeURIComponent(value);

                } catch(e) {
                    log().error(e);
                    query[key] = value;
                }

            } catch(e) {
                log().error(e);
                query[key] = value;
            }
        });

        // Only return the results if all searches have been completed
        if (searchComplete === searchToComplete) {
            return res.send(200, {'results': results, 'query': query});
        }
    };

    // Get results from Aquabrowser
    _getAquabrowserResults(isAquabrowser, query, function(response) {
        _resultsCallback('aquabrowser', query, response);
    });

    // Get results from Summon
    _getSummonResults(isSummon, query, function(response) {
        _resultsCallback('summon', query, response);
    });
};

/**
 * Function that returns a collection of search results from LibrarySearch OR LibrarySearch+
 *
 * @param  {Request}   req    Request
 * @param  {Response}  res    Response
 */
var getResultsFromIndex = exports.getResultsFromIndex = function(req, res) {

    // Check if a query or ID was specified
    if (!req.query.q && !req.query.id) {
        return res.send(400, {'error': 'No valid query or ID given'});
    }

    // Sanitize the query
    var query = _sanitizeQuery(req.query);

    // Store the specified engine
    var engine = req.params.api.toLowerCase();

    // Keep track of the specified API
    var isAquabrowser = (engine === 'aquabrowser');
    var isSummon = (engine === 'summon');

    // In case the engine doesn't exist, we return an error
    if (!isAquabrowser && !isSummon) {
        return res.send(400, {'error': 'Invalid engine set'});
    }

    if (isAquabrowser) {
        _getAquabrowserResults(isAquabrowser, query, function(response) {
            return res.send(200, {'results': {'aquabrowser': response}, 'query': query});
        });
    }

    if (isSummon) {
        _getSummonResults(isSummon, query, function(response) {
            return res.send(200, {'results': {'summon': response}, 'query': query});
        });
    }
};

/**
 * Function that gets the results from the Aquabrowser API implementation
 *
 * @param  {Boolean}   isAquabrowser        Indicates if Aquabrowser has been specified explicitly
 * @param  {Object}    query                Object containing all the query parameters
 * @param  {Function}  callback             Standard callback function
 * @param  {Error}     callback.error       Error object to be sent with the callback function
 * @param  {Object}    callback.response    Object containing the response from the API
 * @api private
 */
var _getAquabrowserResults = function(isAquabrowser, query, callback) {
    AquabrowserAPI.getResults(isAquabrowser, query, function(_err, _res) {
        if (_err) {
            return callback({'error': _err});
        }
        return callback(_res);
    });
};

/**
 * Function that gets the results from the Summon API implementation
 *
 * @param  {Boolean}   isSummon             Indicates if Summon has been specified explicitly
 * @param  {Object}    query                Object containing all the query parameters
 * @param  {Function}  callback             Standard callback function
 * @param  {Error}     callback.error       Error object to be sent with the callback function
 * @param  {Object}    callback.response    Object containing the response from the API
 * @api private
 */
var _getSummonResults = function(isSummon, query, callback) {
    SummonAPI.getResults(isSummon, query, function(_err, _res) {
        if (_err) {
            log().error(_err);
            return callback({'error': _err});
        }
        return callback(_res);
    });
};

/**
 * Function that sanitizes the query
 *
 * @param  {Object}    query                Object containing all the query parameters
 * @return {Object}                         Object containing all the sanitized query parameters
 * @api private
 */
var _sanitizeQuery = function(query) {

    // Make sure only valid parameters are entered in the querystring
    _.each(query, function(value, key) {
        // First check if the parameter is valid
        if (config.constants.search.parameters.indexOf(key) < 0) {
            delete query[key];
        }
    });

    // If a page is set, make sure it is numeric, not a decimal and not negative
    if (query.page) {
        query.page = parseInt(query.page, 10);
        if (isNaN(query.page) || query.page < 1) {
            query.page = 1;
        } else if (query.page > config.constants.search.pageLimit) {
            query.page = config.constants.search.pageLimit;
        }
    }

    // Return the sanitized query
    return query;
};
