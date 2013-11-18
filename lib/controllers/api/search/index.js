var config = require('../../../../config');
var swagger = require('swagger-node-express');

var AquabrowserAPI = require('./aquabrowser');
var SummonAPI = require('./summon');

/**
 * Function that returns a collection of search results of LibrarySearch and LibrarySearch+
 *
 * @param  {Request}   req    Request
 * @param  {Response}  res    Response
 */
var getResults = exports.getResults = function(req, res) {

    // Check if a query has been specified
    if (!req.query.q) {
        return res.send(200, {'error': 'Invalid or no query given'});
    }

    // Get the querystring and internal options out of the request
    var query = req.query;

    // Store how many external API's have been called
    var searchToComplete = Object.keys(config.constants.engines).length;
    var searchComplete = 0;

    // Create an object to store the search results
    var results = {
        'aquabrowser': {},
        'summon': {}
    };

    // Get the results from Aquabrowser
    AquabrowserAPI.getResults(query, function(_err, _res) {

        // Increase our temporary variable when results are retrieved
        searchComplete++;

        if (_err) {
            results['aquabrowser']['error'] = _err;
        } else {
            results['aquabrowser'] = _res;
        }

        if (searchComplete === searchToComplete) {
            return res.send(200, {'results': results, 'query': query});
        }
    });

    // Get the results from Summon
    SummonAPI.getResults(query, function(_err, _res) {

        // Increase our temporary variable when results are retrieved
        searchComplete++;

        if (_err) {
            results['summon']['error'] = _err;
        } else {
            results['summon'] = _res;
        }

        if (searchComplete === searchToComplete) {
            return res.send(200, {'results': results, 'query': query});
        }
    });
};
