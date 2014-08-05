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
var querystring = require('querystring');

var config = require('../../config');
var log = require('lg-util/lib/logger').logger();

var PageModel = require('../models/search/results').Page;
var PaginationModel = require('../models/search/results').Pagination;

////////////////////////
//  PUBLIC FUNCTIONS  //
////////////////////////

/**
 * Function that adds a leading zero to a given digit if necessary
 *
 * @param  {Number|String}  digit    The given digit
 * @return {String}                  The returned digit
 */
var addLeadingZero = module.exports.addLeadingZero = function(digit) {
    if (digit) {
        digit = parseInt(digit, 10);
        if (digit < 10) {
            digit = '0' + digit;
        }
        return String(digit);
    }
    return null;
};

/**
 * Function that constructs a facet url
 *
 * @param  {Object}  parameters    The query parameters
 * @param  {String}  facets        The specified facet name (e.g. format, author,...)
 * @param  {String}  property      The property that should be applied to the url (e.g. book, journal,...)
 * @return {String}                The created facet querystring
 */
var createFacetUrl = module.exports.createFacetUrl = function(parameters, facet, property) {

    // Instantiate a new variable for the url
    var url = null;

    // Construct a querystring by using the existing parameters
    try {

        // Create a duplicate of the parameters
        var params = _.clone(parameters);

        // Convert the parameter key to lowercase characters
        try {
            facet = String(facet).toLowerCase();
        } catch(error) {
            log().error(error);
        }

        // Reset the page parameter
        if (params['page']) {
            delete params['page'];
        }

        // Remove the facet parameter
        if (params['facet']) {
            delete params['facet'];
        }

        params[facet] = property;

        // Create a querystring
        url = querystring.stringify(params);
        url = url.replace(/\%3B/g, ';');

    } catch(error) {
        log().error(error);
        return url;
    }
    return url;
};

/**
 * Function that constructs the facet 'more' url
 *
 * @param  {Object}     parameters      The query parameters
 * @param  {String}     facets          The specified facet name (e.g. format, author,...)
 * @return {String}                     The created more path
 */
var createFacetMoreUrl = module.exports.createFacetMoreUrl = function(parameters, facet) {
    try {
        var params = _.clone(parameters);
        // Delete the page parameter
        delete params['page'];
        // Add the facet paremeter
        params['facet'] = facet;
        // Set the api param to 'aquabrowser' if it isn't set
        params['api'] = params['api'] || 'aquabrowser';
        return querystring.stringify(params);
    } catch(err) {
        log().error(err);
        return null;
    }
};

/**
 * Function that creates a pagination model
 *
 * @param  {Object}      parameters    The query parameters
 * @param  {Integer}     pageNumber    The current page
 * @param  {Integer}     pageCount     The amount of pages
 * @param  {Integer}     firstPage     The first page
 * @param  {Integer}     lastPage      The last page
 * @return {Pagination}                A pagination model
 */
var createPaginationModel = module.exports.createPaginationModel = function(parameters, pageNumber, pageCount, firstPage, lastPage) {

    // First page
    var qs = _createPageQueryString(parameters, firstPage);
    var firstPageObj = new PageModel(qs.page, 'page', qs, true);

    // Previous page
    var visible = (pageCount > 1 && (pageNumber > firstPage));
    var previous = (pageNumber > firstPage) ? (pageNumber - 1) : firstPage;
    qs = _createPageQueryString(parameters, previous);
    var previousPageObj = new PageModel(qs.page, 'page', qs, visible);

    // Next page
    visible = (pageCount > 1 && (pageNumber < lastPage));
    var next = (pageNumber < lastPage) ? (pageNumber + 1) : lastPage;
    qs = _createPageQueryString(parameters, next);
    var nextPageObj = new PageModel(qs.page, 'page', qs, visible);

    // Last page
    qs = _createPageQueryString(parameters, lastPage);
    var lastPageObj = new PageModel(qs.page, 'page', qs, true);

    // Calculate the page range
    var pageRange = _determinePageRange(parameters, pageCount, pageNumber, firstPage, lastPage);

    // Create a new pagination model
    return new PaginationModel(pageNumber, pageCount, firstPageObj, previousPageObj, pageRange, nextPageObj, lastPageObj);
};

/**
 * Function that returns the item's thumbnail
 *
 * @param  {Object}   item    Object containing resource data
 * @return {String}           The item's thumbnail url
 */
var getItemThumbnail = module.exports.getItemThumbnail = function(item) {
    var thumbnail = null;
    if (item['thumbnail_s']) {
        thumbnail = item['thumbnail_s'];
    } else if (item['thumbnail_m']) {
        thumbnail = item['thumbnail_m'];
    } else if (item['thumbnail_l']) {
        thumbnail = item['thumbnail_l'];
    }
    return thumbnail;
};

/**
 * Function that replaces the '<h>' tags in a string
 *
 * @param  {String}   snippet     The string where the tags should be replaced in
 * @return {String}               The string where the tags have been replaced
 */
var replaceTags = module.exports.replaceTags = function(snippet) {
    snippet = snippet.replace(/<h>/g, '<strong>').replace(/<\/h>/g, '</strong>').trim();
    return snippet;
};

/**
 * Function that removes the '<h>' tags from a string
 *
 * @param  {String}   snippet     The string where the tags should be removed from
 * @return {String}               The string where the tags have been removed
 */
var removeTags = module.exports.removeTags = function(snippet) {
    snippet = snippet.replace(/<h>|<\/h>/g, '').trim();
    return snippet;
};

//////////////////////////
//  INTERNAL FUNCTIONS  //
//////////////////////////

/**
 * Function that determines the page range in the pagination
 *
 * @param  {Object}   parameters    The query parameters
 * @param  {Integer}  pageCount     The amount of pages
 * @param  {Integer}  pageNumber    The current page
 * @param  {Integer}  firstPage     The first page
 * @param  {Integer}  lastPage      The last page
 * @return {Object}                 Object containing page navigation values
 * @api private
 */
var _determinePageRange = function(parameters, pageCount, pageNumber, firstPage, lastPage) {

    // Create a new collection to store the pages.
    var pageRange = [];

    // Check if the result contains pages
    if (pageCount) {

        // Add the first page by default.
        pageRange.push(new PageModel(firstPage, 'page', _createPageQueryString(parameters, firstPage), true));

        // If the result returns only 1 page
        if (pageCount === 1) {
            return pageRange;
        }

        // If there are more than 5 pages, we need to set a range of pages, based on the current page
        if (pageCount > 5) {

            // If the page is in the range of the first page
            if (pageNumber < (firstPage + 3) && (pageNumber < (lastPage - 2))) {
                for (var i = 2; i < (pageNumber + 1); i++) {
                    pageRange.push(new PageModel(i, 'page', _createPageQueryString(parameters, i), true));
                }
                pageRange.push(new PageModel(null, 'spacer', null, true));
            }

            // If the page is in the range of the last page
            else if (pageNumber > (lastPage - 3) && (pageNumber > (firstPage + 2))) {
                pageRange.push(new PageModel(null, 'spacer', null, true));
                for (var i = pageNumber; i < lastPage; i++) {
                    pageRange.push(new PageModel(i, 'page', _createPageQueryString(parameters, i), true));
                }
            }

            // If the page is out of the range of the first and the last page
            else if (pageNumber > (firstPage + 2) && pageNumber < (lastPage - 2)) {
                pageRange.push(new PageModel(null, 'spacer', null, true));
                for (var i = (pageNumber - 1); i < (pageNumber + 2); i++ ) {
                    pageRange.push(new PageModel(i, 'page', _createPageQueryString(parameters, i), true));
                }
                pageRange.push(new PageModel(null, 'spacer', null, true));
            }

        // If there are 5 or less pages, they are all displayed in the pagination
        } else {
            for (var i = (firstPage + 1); i<lastPage; i++) {
                pageRange.push(new PageModel(i, 'page', _createPageQueryString(parameters, i), true));
            }
        }

        // Add the last page by default
        pageRange.push(new PageModel(lastPage, 'page', _createPageQueryString(parameters, lastPage), true));
    }

    // Return the collection
    return pageRange;
};

/**
 * Function that replaces the page number in the parameters object
 *
 * @param  {Object}   parameters    The query parameters
 * @param  {Integer}  page          The page number
 * @param  {String}                 The returned querystring
 * @api private
 */
var _createPageQueryString = function(parameters, page) {
    var pageParams = _.clone(parameters);
    pageParams.page = page;
    return querystring.stringify(pageParams);
};
