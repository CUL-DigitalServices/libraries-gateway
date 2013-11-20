/**
 * A results model
 *
 * @param  {Number}    rowCount    The total amount of items found
 * @param  {Facet[]}   facets      Collection of facets
 * @param  {Result[]}  items       Collection of items
 * @return {Object}                Returned collection for the used engine
 */
exports.Results = function(rowCount, facets, items) {
    var that = {};
    that.rowCount = rowCount;
    that.facets = facets
    that.items = items;
    return that;
};
