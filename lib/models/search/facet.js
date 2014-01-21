/**
 * A facet type model
 *
 * @param  {String}   label       The label of the facet type (e.g. 'Uniform Title')
 * @param  {String}   rawLabel    The 'raw' label of the facet type (e.g. 'UniformTitle')
 * @param  {Number}   numItems    The amount of items the facet type contains
 * @param  {Facet[]}  facets      Collection of facets matching the specified type
 * @return {Facet}                The returned facet type object
 */
exports.FacetType = function(label, rawLabel, numItems, facets) {
    var that = {};
    that.label = label;
    that.rawLabel = rawLabel;
    that.numItems = numItems;
    that.facets = facets;
    return that;
};

/**
 * A facet model
 *
 * @param  {String}  label     The label of the facet (e.g. book, paper, article...)
 * @param  {Number}  amount    The amount of facets per category
 * @return {Facet}             The returned facet object
 */
exports.Facet = function(label, numItems, url) {
    var that = {};
    that.label = label;
    that.numItems = numItems;
    that.url = url;
    return that;
};
