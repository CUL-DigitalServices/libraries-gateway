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

    // Check if a query was specified
    if (!req.query.q) {
        return res.send(200, {'error': 'Invalid or no query given'});
    }

    // Get the querystring and internal options out of the request
    var query = req.query;

    // Check if a searchengine was specified
    if (req.params.id) {

        // Store the specified engine
        var engine = req.params.id.toLowerCase();

        // In case the engine doesn't exist, we return an error
        if (engine !== 'aquabrowser' && engine !== 'summon') {
            return res.send(200, {'error': 'Invalid engine set'});            
        }

        if (engine === 'aquabrowser') {
            getAquabrowserResults(query, function(response) {
                return res.send(200, {'results': {'aquabrowser': response}, 'query': query});
            });
        }

        if (engine === 'summon') {
            getSummonResults(query, function(response) {
                return res.send(200, {'results': {'summon': response}, 'query': query});
            });
        }

    // If no engine was specified, we use both Aquabrowser and Summon
    } else {

        // Store how many external API's have been called, since we do async requests
        var searchToComplete = Object.keys(config.constants.engines).length;
        var searchComplete = 0;

        // Create an object to store the search results
        var results = {
            'aquabrowser': {},
            'summon': {}
        };

        // Get results from Aquabrowser
        getAquabrowserResults(query, function(response) {

            // Increase our temporary variable when results are retrieved
            searchComplete++;

            // Add the retrieved results to the main object
            results['aquabrowser'] = response;

            // Only return the results if all searches have been completed
            if (searchComplete === searchToComplete) {
                return res.send(200, {'results': results, 'query': query});
            }
        });

        // Get results from Summon
        getSummonResults(query, function(response) {

            // Increase our temporary variable when results are retrieved
            searchComplete++;

            // Add the retrieved results to the main object
            results['summon'] = response;

            // Only return the results if all searches have been completed
            if (searchComplete === searchToComplete) {
                return res.send(200, {'results': results, 'query': query});
            }
        });
    }
};

/**
 * Function that gets the results from the Aquabrowser API implementation
 *
 * @param  {Object}    query                Object containing all the query parameters
 * @param  {Function}  callback             Standard callback function
 * @param  {Object}    callback.response    Object containing the response from the API
 * @api private
 */
var getAquabrowserResults = function(query, callback) {
    AquabrowserAPI.getResults(query, function(_err, _res) {
        if (_err) {
            return callback({'error': _err});
        }
        return callback(_res);
    });
};

/**
 * Function that gets the results from the Summon API implementation
 *
 * @param  {Object}    query                Object containing all the query parameters
 * @param  {Function}  callback             Standard callback function
 * @param  {Object}    callback.response    Object containing the response from the API
 * @api private
 */
var getSummonResults = function(query, callback) {
    SummonAPI.getResults(query, function(_err, _res) {
        if (_err) {
            return callback({'error': _err});
        }
        return callback(_res);
    });
};
