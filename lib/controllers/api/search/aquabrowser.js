var _ = require('underscore');
var request = require('request');
var swagger = require('swagger-node-express');
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
            callback('An error occured while parsing Aquabrowser data');
            console.log(err);
        } else {

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
                if (err) {
                    callback('An error occured while parsing Aquabrowser data');
                }

                if (res) {

                    // Variable to store all the results from Aquabrowser
                    var aquabrowserResults = [];

                    // Returned records from Aquabrowser
                    var numRecords = res['root']['feedbacks']['standard']['resultcount'];
                    
                    // If records are found
                    if (numRecords) {
                        _.each(res['root']['results']['record'], function(record, index) {
                            if (record.fields) {

                            }
                        });

                        /*
                        var records = [];
                        var result = res['srw:searchRetrieveResponse']['srw:records']['srw:record'];
                        if (!_.isArray(result)) {
                            records.push(result);
                        } else {
                            records = result;
                        }

                        // Loop all the records and create a new resultmodel for each record
                        _.each(records, function(record) {

                            var title = "Title not found";
                            if (record['srw:recordData']) {
                                if (record['srw:recordData']['dc:title']) {
                                    title = record['srw:recordData']['dc:title'];
                                }
                            }

                            var author = "Author not found";
                            if (record['srw:recordData']) {
                                if (record['srw:recordData']['dc:creator']) {
                                    author = record['srw:recordData']['dc:creator'];
                                }
                            }

                            var date = "Date not found";
                            if (record['srw:recordData']) {
                                if (record['srw:recordData']['dc:date']) {
                                    date = record['srw:recordData']['dc:date'];
                                }
                            }

                            var link = "Link not found";
                            if (record['srw:recordData']) {
                                if (record['srw:extraRecordData']['recordURL']){
                                    link = record['srw:extraRecordData']['recordURL'];
                                }
                            }
                            
                            var contentType = "contentType not found";
                            if (record['srw:recordData']) {
                                if (record['srw:recordData']['dc:format']) {
                                    contentType = record['srw:recordData']['dc:format'];
                                }
                            }

                            var thumbnail = '';
                            if (record['srw:recordData']) {
                                if (record['srw:extraRecordData']['coverimageurl']) {
                                    thumbnail = record['srw:extraRecordData']['coverimageurl'];
                                }
                            }

                            var branch = "Branch not found";
                            if (record['srw:recordData']) {
                                if (record['srw:extraRecordData']['dc:branch']) {
                                    branch = record['srw:extraRecordData']['dc:branch'];                                
                                }
                            }

                            var publicationPlace = null;

                            var result = new ResultModel.Result(title, author, date, link, contentType, thumbnail, publicationPlace, branch);
                            aquabrowserResults.push(result);
                        });
                        */
                    }

                    var results = new ResultsModel.Results(numRecords, [], aquabrowserResults);
                    return callback(null, results);
                }
            });
        }
    });
};
