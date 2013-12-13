/**
 * A results model
 * Object that contains all the data that is displayed on the search results page
 *
 * @param  {Integer}       rowCount          The total amount of items found
 * @param  {Facet[]}       facets            Collection of facets
 * @param  {Result[]}      items             Collection of items
 * @param  {Pagination}    pagination        Pagination properties
 * @param  {Suggestions}   suggestions       Collection of suggestions
 * @return {Results}                         Returned collection for the used engine
 */
exports.Results = function(rowCount, facets, items, pagination, suggestions) {
    var that = {};
    that.rowCount = rowCount;
    that.facets = facets
    that.items = items;
    that.pagination = pagination;
    that.suggestions = suggestions;
    return that;
};

/**
 * A pagination model
 * Object that contains information about the pagination for a specific API
 *
 * @param  {Integer}       pageNumber        The current page
 * @param  {Integer}       pageCount         The amount of pages
 * @param  {Page}          previousPage      The previous page
 * @param  {Page}          firstPage         The first page
 * @param  {Page[]}        pageRange         Collection of pagination navigation items
 * @param  {Page}          lastPage          The last page
 * @param  {Page}          nextPage          The next page
 * @return {Pagination}                      The pagination values
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
 * Collection of pages that will be displayed on the pagination of the search results
 *
 * @param  {Integer}       number            The page number
 * @param  {String}        type              The type (page|spacer)
 * @param  {String}        url               The url of the page
 * @param  {Boolean}       visible           The visibility of the page (true|false)
 * @return {Page}                            The created page
 */
exports.Page = function(number, type, url, visible) {
    var that = {};
    that.number = number;
    that.type = type;
    that.url = url;
    that.visible = visible;
    return that;
};

/**
 * A suggestion model
 *
 * @param  {String}        label             The suggestion label (e.g. darwin)
 * @param  {String}        url               The constructed suggestion url (e.g q=darwin&format=books)
 * @return {Suggestion}                      The returned suggestion object
 */
exports.Suggestion = function(label, url) {
    var that = {};
    that.label = label;
    that.url = url;
    return that;
};

/**
 * A suggestions model
 * Collection of suggestions if you enter an invalid query (e.g. darrwin, daarwin, etc...)
 *
 * @param  {String}        originalQuery     The entered query (e.g. darrwin, etc...)
 * @param  {Suggestion[]}  suggestedItems    The suggestion items (e.g. darwin, darwinism, etc...)
 * @return {Suggestions}                     The created suggestions object
 *
 */
exports.Suggestions = function(originalQuery, suggestedItems) {
    var that = {};
    that.originalQuery = originalQuery;
    that.suggestedItems = suggestedItems;
    return that;
};
