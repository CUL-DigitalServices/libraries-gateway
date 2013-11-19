var _ = require('underscore');
var crypto = require('crypto');
var request = require('request');

var config = require('../../../../config');

var ResultModel = require('../../../models/search/result');
var ResultsModel = require('../../../models/search/results');

/**
 * Function that returns the results from Summon
 *
 * @see http://api.summon.serialssolutions.com
 * @see https://github.com/summon/Summon.php/blob/master/SerialsSolutions/Summon/Base.php
 *
 * @param  {String}     _queryString        Querystring
 * @param  {Function}   callback            The callback function
 * @param  {Error}      callback.error      Error object to be send with the callback function
 * @param  {Results[]}  callback.results    Collection of results to be send with the callback function
 */
var getResults = module.exports.getResults = function(_queryString, callback) {

    // Create a new array for the query parameters.
    // s.ff: Return all the facets
    var queryString = ['s.ff=ContentType,or,,'];

    // Check if the keyword has been set
    if (_queryString && _queryString['q']) {
        queryString.push('s.q=' + _queryString['q']);
    }

    // Check if the format is set
    if (_queryString && _queryString['format'] && _queryString['format'] !== 'all') {
        var format = config.constants.formats[_queryString['format']]['summon'];
        queryString.push('s.fvf=ContentType,' + format + ',false');
    }

    // Check if a limit for records is set
    if (_queryString && _queryString['records'] > 0) {
        queryString.push('s.ps=' + _queryString['records']);
    }

    // Create the header object that will be sent to the Summon API
    var headers = {
        'Accept': 'application/json',
        'x-summon-date': convertDate(new Date()),
        'Host': config.constants.engines.summon.uri,
        'Version': config.constants.engines.summon.version
    };

    queryString = queryString.sort();
    queryString = queryString.join('&');
    queryString = decodeURIComponent(queryString);

    // Convert the header to a string to create a hash afterwards
    var headerString = constructHeaderString(headers) + queryString + '\n';

    // Create a hash from the application key and the headerString
    var sha1Digest = crypto.createHmac('sha1', config.constants.engines.summon.auth.key).update(headerString).digest('base64');

    // Construct the header authentication string
    var authHeaderString = 'Summon ' + config.constants.engines.summon.auth.id + ';' + sha1Digest;
    headers['Authorization'] = authHeaderString;

    // Construct the request url
    var url = 'http://' + headers['Host'] + headers['Version'] + '?' + queryString;

    // Create an options object that can be submitted to the Summon API
    var options = {
        'method': 'GET',
        'url': url,
        'timeout': config.constants.engines.summon.timeout,
        'headers': headers
    };

    // Perform the request to the Summon API
    request(options, function(err, res, body) {

        if (err) {
            callback(err);
        } else {

            // Try parsing the JSON string as an object
            try {
                var response = JSON.parse(res.body);

                // Variable to store all the results from Summon
                var summonResults = [];

                // Facets
                var facets = [];
                if (response.facetFields.length) {
                    facets = response.facetFields[0].counts;
                }

                // Documents
                _.each(response.documents, function(item) {

                    var title = cleanUpValue(item['Title'][0]);

                    var author = "Author not found";
                    if (item['Publisher_xml']) {
                        if (item['Publisher_xml'][0]){
                            author = item['Publisher_xml'][0]['name'];
                        }
                    }

                    var date = "Date not found";
                    if (item['PublicationDate']) {
                        if (item['PublicationDate'][0]){
                            var date = item['PublicationDate'][0];
                        }
                    }

                    var link = cleanUpValue(item.link);
                    var contentType = cleanUpValue(item['ContentType'][0]);

                    var thumbnail = null;
                    if (item['thumbnail_s']) {
                        if (item['thumbnail_s'][0]){
                            thumbnail = item['thumbnail_s'][0];
                        }
                    }

                    var publicationPlace = null;
                    if (item['PublicationPlace']) {
                        if (item['PublicationPlace'][0]) {
                            publicationPlace = item['PublicationPlace'][0];
                        }
                    }

                    var branch = null;

                    var result = new ResultModel.Result(title, author, date, link, contentType, thumbnail, publicationPlace, branch);
                    summonResults.push(result);
                });

                var results = new ResultsModel.Results(response.recordCount, facets, summonResults);
                callback(null, results);

            // When the parsing of the Summon result failed
            } catch (e) {
                callback('An error occured while parsing Summon data');
                console.log(e);
            }
        }
    });
};

/**
 * Converts the header object to a string, needed for the Summon authentication
 *
 * @param  {Object} header          Object containing all the header information
 * @return {String} headerString    String that will be used as a hash for the authentication
 * @api private
 */
var constructHeaderString = function(header) {
    var headerString = '';
    _.each(header, function(value, key) {
        headerString += value + '\n';
    });
    return headerString;
}

/**
 * Converts the date to the correct GMT
 *
 * @param  {Date}  date             The date in a CEST format
 * @return {Date}  date             The date in a GMT format
 * @api private
 */
var convertDate = function(date) {
    var d = date;
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    var offset = 0;
    return new Date(utc + (3600000 * offset)).toUTCString();
};

/**
 * Strips the value down to a simple string
 *
 * @param  {String}  value          The value thad needs to be stripped
 * @return {String}  stripped       The cleaned up value
 * @api private
 */
var cleanUpValue = function(value) {
    if (value) {
        var stripped = value.replace('<h>','').replace('</h>','');
        return stripped;
    }
    return;
};
