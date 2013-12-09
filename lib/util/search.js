var _ = require('underscore');
var querystring = require('querystring');

var PageModel = require('../models/search/results').Page;
var PaginationModel = require('../models/search/results').Pagination;

/**
 * Function that creates a pagination model
 *
 * @param  {Object}      parameters      The query parameters
 * @param  {Number}      pageNumber      The current page
 * @param  {Number}      pageCount       The amount of pages
 * @param  {Number}      firstPage       The first page
 * @param  {Number}      lastPage        The last page
 * @return {Pagination}                  A pagination model
 */
var createPaginationModel = module.exports.createPaginationModel = function(parameters, pageNumber, pageCount, firstPage, lastPage) {

    // First page
    var qs = _createPageQueryString(parameters, firstPage);
    var firstPageObj = new PageModel(qs.page, 'page', qs, true);

    // Previous page
    var visible = false;
    if (pageCount > 1 && (pageNumber > firstPage)) visible = true;
    var qs = _createPageQueryString(parameters, pageNumber - 1);
    var previousPageObj = new PageModel(qs.page, 'page', qs, visible);

    // Next page
    var visible = false;
    if (pageCount > 1 && (pageNumber < lastPage)) visible = true;
    var qs = _createPageQueryString(parameters, pageNumber + 1);
    var nextPageObj = new PageModel(qs.page, 'page', qs, visible);

    // Last page
    var qs = _createPageQueryString(parameters, lastPage);
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
 * @param  {Number}      pageCount       The amount of pages
 * @param  {Number}      pageNumber      The current page
 * @param  {Number}      firstPage       The first page
 * @param  {Number}      lastPage        The last page
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

        // Add the last page by default
        pageRange.push(new PageModel(lastPage, 'page', _createPageQueryString(parameters, lastPage), true));
    }

    // Return the collection
    return pageRange;
};

/**
 * Function that replaces the page number in the parameters object
 *
 * @param  {Object}      parameters      The query parameters
 * @param  {Number}      page            The page number
 * @param  {String}                      The returned querystring
 * @api private
 */
var _createPageQueryString = function(parameters, page) {
    var pageParams = _.clone(parameters);
    pageParams.page = Number(page);
    return querystring.stringify(pageParams);
};
