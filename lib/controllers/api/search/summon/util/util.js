var _ = require('underscore');

var libUtil = require('../../../../../util/util');
var log = require('../../../../../util/logger').logger();
var searchUtil = require('../../../../../util/search');

var ResultModel = require('../../../../../models/search/result');

/**
 * Strips the value down to a simple string
 *
 * @param  {String}  value    The value thad needs to be stripped
 * @return {String}           The cleaned up value
 */
var cleanUpValue = module.exports.cleanUpValue = function(value) {
    if (value) {
        if (_.isArray(value)) {
            var newArray = [];
            _.each(value, function(item) {
                newArray.push(item.replace(/<\/?h>/g,''));
            });
            return newArray;
        }
        return value.replace(/<\/?h>/g,'');
    }
    return null;
};

/**
 * Converts the header object to a string, needed for the Summon authentication
 *
 * @param  {Object}  header    Object containing all the header information
 * @return {String}            String that will be used as a hash for the authentication
 */
var constructHeaderString = module.exports.constructHeaderString = function(header) {
    var headerString = '';
    _.each(header, function(value, key) {
        headerString += value + '\n';
    });
    return headerString;
}

/**
 * Converts the date to the correct GMT
 *
 * @param  {Date}  date    The date in a CEST format
 * @return {Date}          The date in a GMT format
 */
var convertDate = module.exports.convertDate = function(date) {
    var d = date;
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    var offset = 0;
    return new Date(utc + (3600000 * offset)).toUTCString();
};

/**
 * Function that fetches all the authors from a resource
 *
 * @param  {Array}  item    The item data
 * @return {Array}          The value of the requested item property
 */
var getResourceAuthors = module.exports.getResourceAuthors = function(item) {
    try {
        var authors = [];
        _.each(item['Author_xml'], function(row) {
            if (row.fullname) {
                authors.push(new ResultModel.Author(row.fullname));
            }
        });
        if (authors && !authors.length) authors = null;
        return authors;
    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that fetches the resource publication data
 *
 * @param  {Object}           item       The item data
 * @return {PublicationData}             The created PublicationData model
 */
var getResourcePublicationData = module.exports.getResourcePublicationData = function(item) {
    try {

        // Date
        var day = null;
        var month = null;
        var year = null;

        if (item['PublicationDate_xml'] && item['PublicationDate_xml'][0]) {
            if (item['PublicationDate_xml'][0]['day']) {
                day = item['PublicationDate_xml'][0]['day'];
            }
            if (item['PublicationDate_xml'][0]['month']) {
                month = item['PublicationDate_xml'][0]['month'];
            }
            if (item['PublicationDate_xml'][0]['year']) {
                year = item['PublicationDate_xml'][0]['year'];
            }
        }

        var lblDate = _.compact([day, month, year]).join('-');
        var publicationDate = new ResultModel.PublicationDate(day, month, year, lblDate);

        var publicationTitle = null;
        if (item['PublicationTitle'] && item['PublicationTitle'][0]) {
            publicationTitle = libUtil.putInArrayIfNotNull(libUtil.consolidateValue(item['PublicationTitle']));
        }

        var publicationVolume = null;
        if (item['Volume']) {
            publicationVolume = libUtil.putInArrayIfNotNull(libUtil.consolidateValue(item['Volume']));
        }

        var publicationIssue = null;
        if (item['Issue']) {
            publicationIssue = libUtil.putInArrayIfNotNull(libUtil.consolidateValue(item['Issue']));
        }

        // Pages
        var startPage = null;
        if (item['StartPage'] && item['StartPage'][0]) {
            startPage = libUtil.consolidateValue(item['StartPage'][0]);
        }

        var endPage = null;
        if (item['EndPage'] && item['EndPage'][0]) {
            startPage = libUtil.consolidateValue(item['EndPage'][0]);
        }

        var lblPage = _.compact([startPage, endPage]).join('-');
        var publicationPage = new ResultModel.PublicationPage(startPage, endPage, lblPage);

        // Create a new publication data model
        var publicationData = new ResultModel.PublicationData(publicationTitle, publicationDate, publicationVolume, publicationIssue, publicationPage);
        return publicationData;

    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that picks the data for a specific property out of a record
 *
 * @param  {Array}  item    The item data
 * @return {Array}          The value of the requested item property
 */
var getPropertyData = module.exports.getPropertyData = function(item, key) {
    try {
        var value = null;
        if (item[key]) {
            value = cleanUpValue(item[key]);
            if (!_.isArray(item[key])) {
                return [value];
            }
        }
        return value;
    } catch(error) {
        log().error(error);
        return null;
    }
};
