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

/**
 * A facet type model
 *
 * @param  {String}     label       The label of the facet type (e.g. 'Uniform Title')
 * @param  {String}     rawLabel    The 'raw' label of the facet type (e.g. 'UniformTitle')
 * @param  {Number}     numItems    The number of items the facet type contains
 * @param  {Number}     more        The number of extra facets available
 * @param  {Facet[]}    facets      Collection of facets matching the specified type
 * @return {Facet}                  The returned facet type object
 */
exports.FacetType = function(label, rawLabel, numItems, more, moreUrl, facets) {
    var that = {};
    that.label = label;
    that.rawLabel = rawLabel;
    that.numItems = numItems;
    that.more = more;
    that.moreUrl = moreUrl;
    that.facets = facets;
    return that;
};

/**
 * A facet model
 *
 * @param  {String}     label       The label of the facet (e.g. book, paper, article...)
 * @param  {Number}     numItems    The number of facets per category
 * @param  {String}     url         The generated url
 * @return {Facet}                  The returned facet object
 */
exports.Facet = function(label, numItems, url) {
    var that = {};
    that.label = label;
    that.numItems = numItems;
    that.url = url;
    return that;
};
