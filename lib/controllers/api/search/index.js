var _ = require('underscore');
var config = require('../../../../config');

var AquabrowserAPI = require('./aquabrowser');
var SummonAPI = require('./summon');

/**
 * Function that returns a collection of search results of LibrarySearch and/or LibrarySearch+
 *
 * @param  {Request}   req    Request
 * @param  {Response}  res    Response
 */
var getResults = exports.getResults = function(req, res) {

    // Check if a query or ID was specified
    if (!req.query.q && !req.query.id) {
        return res.send(400, {'error': 'No valid query or ID given'});
    }

    // Get the querystring and internal options out of the request
    var query = req.query;

    // Make sure no invalid characters were added in the querystring
    try {
        _.each(query, function(value, key) {
            // First check if the parameter is valid
            if (config.constants.search.parameters.indexOf(key) > -1) {
                // Remove all the invalid characters from the property value
                query[key] = encodeURIComponent(value);
            // Delete the parameter if invalid
            } else {
                delete query[key];
            }
        });
    } catch(e) {
        return res.send(400, {'error': 'Invalid parameter entered'});
    }

    // Initialize API checks
    var isAquabrowser = false;
    var isSummon = false;

    // If a page is set, make sure it is numeric, not a decimal and not negative
    if (query.page) {
        query.page = parseInt(query.page, 10);
        if (isNaN(query.page) || query.page < 1) {
            query.page = 1;
        } else if (query.page > config.constants.search.pageLimit) {
            query.page = config.constants.search.pageLimit;
        }
    }

    // Check if a search engine was specified
    if (req.params.api) {

        // Store the specified engine
        var engine = req.params.api.toLowerCase();

        isAquabrowser = (engine === 'aquabrowser');
        isSummon = (engine === 'summon');

        // In case the engine doesn't exist, we return an error
        if (!isAquabrowser && !isSummon) {
            return res.send(200, {'error': 'Invalid engine set'});
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

    // If no engine was specified, we use both Aquabrowser and Summon
    } else {

        // Keep track of the specified API
        isAquabrowser = false;
        isSummon = false;

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
                    query[key] = decodeURIComponent(value);
                } catch(e) {
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
            return callback({'error': _err});
        }
        return callback(_res);
    });
};
