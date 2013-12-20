var _ = require('underscore');
var querystring = require('querystring');

var config = require('../../config');

var log = require('./logger').logger();

var PageModel = require('../models/search/results').Page;
var PaginationModel = require('../models/search/results').Pagination;

/**
 * Function that constructs a facet url
 *
 * @param  {Object}      parameters      The query parameters
 * @param  {String}      facets          The specified facet name (e.g. format, author,...)
 * @param  {String}      property        The property that should be applied to the url (e.g. book, journal,...)
 * @return {String}                      The created facet querystring
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
        } catch(e) {
            log().error(e);
        }

        // Reset the page parameter
        if (params['page']) {
            params['page'] = 1;
        }

        params[facet] = property;

        // Create a querystring
        url = querystring.stringify(params);

    } catch(e) {
        log().error(e);
        return url;
    }
    return url;
};

/**
 * Function that creates a pagination model
 *
 * @param  {Object}      parameters      The query parameters
 * @param  {Integer}     pageNumber      The current page
 * @param  {Integer}     pageCount       The amount of pages
 * @param  {Integer}     firstPage       The first page
 * @param  {Integer}     lastPage        The last page
 * @return {Pagination}                  The created pagination model
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
 * Function that determines the page range in the pagination
 *
 * @param  {Object}      parameters      The query parameters
 * @param  {Integer}     pageCount       The amount of pages
 * @param  {Integer}     pageNumber      The current page
 * @param  {Integer}     firstPage       The first page
 * @param  {Integer}     lastPage        The last page
 * @return {Object}                      Object containing page navigation values
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

/**
 * Function that fetches the correct format from the config file
 *
 * @param  {String}   api       The specified API
 * @param  {String}   format    The entered format
 * @return {String}             The API specific format
 */
var getAPISpecificFormat = module.exports.getAPISpecificFormat = function(api, format) {

    console.log('\ngetAPISpecificFormat');
    console.log('api: ' + api);
    console.log('format: ' + format);

    return format;
};







