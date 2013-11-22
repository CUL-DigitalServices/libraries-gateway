var _ = require('underscore');
var request = require('request');
var xml2js = require('xml2js');

var config = require('../../../../config');

var ResultModel = require('../../../models/search/result');
var ResultsModel = require('../../../models/search/results');

/**
 * Function that returns the results from Aquabrowser
 *
 * @see http://www.lib.cam.ac.uk/api/docs/ab_sru.htm
 * @see http://www.lib.cam.ac.uk/libraries/login/documentation/doc_Aquabrowser.html
 *
 * @param  {String}     _queryString        Querystring
 * @param  {Function}   callback            The callback function
 * @param  {Error}      callback.error      Error object to be send with the callback function
 * @param  {Results[]}  callback.results    Collection of results to be send with the callback function
 */
var getResults = module.exports.getResults = function(_queryString, callback) {
    
    // The queryString variable only contains parameters for the items themselve
    var queryString = ['title:' + _queryString['q']];

    // The extreParams contain parameters to do the search in the external API
    var extraParams = ['cmd=find', 'output=xml'];

    // Check if the format is set
    if (_queryString && _queryString['format'] && _queryString['format'] !== 'all') {
        var format = config.constants.formats[_queryString['format']]['aquabrowser'];
        queryString.push('format:' + format);        
    }

    // Check if a limit is set for items per page
    var limit = 10;
    if (_queryString && _queryString['records']) {
        extraParams.push('maximumRecords=' + limit);
    }

    // Check if the branch is set
    if (_queryString && _queryString['branch']) {
        extraParams.push('branch=' + _queryString['branch']);
    }

    // Check if the current page is set
    if (_queryString && _queryString['page']) {
        extraParams.push('curpage=' + _queryString['page']);
    }

    // Construct the url for the request
    extraParams.push('q=' + encodeURIComponent(queryString.join(' ')))
    var url = config.constants.engines.aquabrowser.uri + '?' + extraParams.sort().join('&');

    // Create an options object that can be submitted to the Aquabrowser API
    var options = {
        'url': url,
        'timeout': config.constants.engines.aquabrowser.timeout
    };

    // Perform the request to the Aquabrowser API
    request(options, function(err, res, body) {
        if (err) {
            return callback('An error occured while fetching Aquabrowser data');
        }

        // Remove all the whitespace characters from the xml
        var xml = res.body.trim();

        // Create an options object for the JSON parsing
        var parseOpts = {
            'trim': true, 
            'mergeAttrs': true, 
            'explicitArray': false
        };

        // Parse the XML as a JSON string
        var jsonstring = xml2js.parseString(xml, parseOpts, function(err, res) {
            if (err || !res.root) {
                return callback('An error occured while fetching Aquabrowser data');
            }

            // Variable to store all the results from Aquabrowser
            var aquabrowserResults = [];

            // Returned records from Aquabrowser
            var numRecords = res['root']['feedbacks']['standard']['resultcount'];
            
            // If records are found
            if (numRecords) {
                var records = res['root']['results']['record'];
                _.each(records, function(record, index) {
                    if (record.fields) {

                        var title = "The item\'s title";
                        var author = "The item\'s author";
                        var date = "The item\'s date";
                        var link = "The item\'s link";
                        var contentType = "The item\'s contentType";
                        var thumbnail = '';
                        var branch = "The item\'s branch";
                        var publicationPlace = null;

                        // Create a new model for each result and add it to the result collection
                        var result = new ResultModel.Result(title, author, date, link, contentType, thumbnail, publicationPlace, branch);
                        aquabrowserResults.push(result);
                    }
                });
            }

            // Put all the result models into a containing results model
            var results = new ResultsModel.Results(numRecords, [], aquabrowserResults);
            return callback(null, results);
        });
    });
};
