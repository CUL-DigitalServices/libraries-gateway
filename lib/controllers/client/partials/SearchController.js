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

var config = require('../../../../config');

/**
 * Constructor
 */
var SearchController = module.exports.SearchController = function() {
    var that = this;

    /**
     * Function that renders the search box template
     *
     * @param  {Request}    req                 The request object
     * @param  {Response}   res                 The response object
     * @param  {Object}     parameters          The parameters object
     * @param  {Function}   callback            Standard callback function
     * @param  {Error}      callback.error      The thrown error
     * @param  {String}     callback.template   The HTML dump of the search template
     */
    that.getContent = function(req, res, parameters, callback) {

        // Create a search options object
        var searchOptions = {
            'data': {
                'formats': config.constants.formats,
                'query': parameters.query || null
            }
        };

        // Render the search partial
        res.render('partials/find-a-resource/search', searchOptions, function(error, template) {
            if (error) {
                return callback(error);
            }
            return callback(null, template);
        });
    };
};
