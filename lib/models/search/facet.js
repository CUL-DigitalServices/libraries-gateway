/**
 * A facet type model
 *
 * @param  {String}   label                The label of the facet type (e.g. format, author...)
 * @param  {Integer}  numItems             The amount of items the facet type contains
 * @param  {Facet[]}  facets               Collection of facets matching the specified type
 * @return {Facet}                         The returned facet type object
 */
exports.FacetType = function(label, numItems, facets) {
    var that = {};
    that.label = label;
    that.numItems = numItems;
    that.facets = facets;
    return that;
};

/**
 * A facet model
 *
 * @param  {String}   label                The label of the facet (e.g. book, paper, article...)
 * @param  {Integer}  numItems             The amount of facets per category
 * @param  {String}   url                  The constructed url
 * @return {Facet}                         The returned facet object
 */
exports.Facet = function(label, numItems, url) {
    var that = {};
    that.label = label;
    that.numItems = numItems;
    that.url = url;
    return that;
};
