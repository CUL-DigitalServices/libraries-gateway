/**
 * A results model
 *
 * @param  {Number}      rowCount        The total amount of items found
 * @param  {Facet[]}     facets          Collection of facets
 * @param  {Result[]}    items           Collection of items
 * @param  {Pagination}  pagination      Pagination properties
 * @return {Results}                     Returned collection for the used engine
 */
exports.Results = function(rowCount, facets, items, pagination) {
    var that = {};
    that.rowCount = rowCount;
    that.facets = facets
    that.items = items;
    that.pagination = pagination;
    return that;
};

/**
 * A pagination model
 *
 * @param  {Number}      pageNumber      The current page
 * @param  {Number}      pageCount       The amount of pages
 * @param  {Page}        previousPage    The previous page
 * @param  {Page}        firstPage       The first page
 * @param  {Page[]}      pageRange       Collection of pagination navigation items
 * @param  {Page}        lastPage        The last page
 * @param  {Page}        nextPage        The next page
 * @return {Pagination}                  The pagination values
 */
exports.Pagination = function(pageNumber, pageCount, firstPage, previousPage, pageRange, nextPage, lastPage) {
    var that = {};
    that.pageNumber = pageNumber;
    that.pageCount = pageCount;
    that.firstPage = firstPage;
    that.previousPage = previousPage;
    that.pageRange = pageRange;
    that.nextPage = nextPage;
    that.lastPage = lastPage;
    return that;
};

/**
 * A page model
 *
 * @param  {String}      number          The page number
 * @param  {String}      type            The type (page|spacer)
 * @param  {String}      url             The url of the page
 * @param  {Boolean}     visible         The visibility of the page (true|false)
 * @return {Page}                        The created page
 */
exports.Page = function(number, type, url, visible) {
    var that = {};
    that.number = number;
    that.type = type;
    that.url = url;
    that.visible = visible;
    return that;
};
