var _ = require('underscore');
var request = require('request');
var xml2js = require('xml2js');

var config = require('../../../../config');

var libraryModel = require('../../../models/libraries/library');

var libraries = [];

/**
 * Function that returns a collection of all the libraries and their data
 *
 * @param  {Request}   req    Request object
 * @param  {Response}  res    Response object
 */
var getLibraries = exports.getLibraries = function(req, res) {

    // Check if the libraries are already cached
    if (libraries && libraries.length) {
        return res.send(200, libraries);
    }

    // Otherwise, fetch all the libraries
    fetchLibrariesFromAPI(function(error, results) {
        if (error) {
            return res.send(400, {'error': error});
        }

        // Get the library collection out of the results
        libraries = results.libraries.library;

        // Check if a library ID has been specified
        if (req.params.id) {
            var results = _.where(libraries, {'id': req.params.id});
            return res.send(200, results);
        }

        // Return the results
        return res.send(200, libraries);
    });
};

/**
 * Function that sends a request to the external endpoint to fetch all the library information
 *
 * @param  {Function}  callback            Standard callback function
 * @param  {Error}     callback.error      Error object to be send with the callback function
 * @param  {Results}   callback.results    Object containing a collection of libraries
 * @api private
 */
var fetchLibrariesFromAPI = function(callback) {
    request({'url': config.constants.libraries.uri}, function(err, res, body) {
        if (err) {
            return callback(err);
        }

        // Parse the XML to a JSON-string
        try {
            xml2js.parseString(body, {'mergeAttrs': true}, function(error, data) {
                if (error) {
                    return callback("Unable to parse the library XML");
                }
                return callback(null, data);
            });            
        } catch (error) {
            return callback("Unable to parse the library XML");
        }
    });
};
