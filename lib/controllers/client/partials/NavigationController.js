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
var libutil = require('../../../util/util');

/**
 * Constructor
 */
var NavigationController = module.exports.NavigationController = function() {
    var that = this;

    /**
     * Function that renders the navigation template
     *
     * @param  {Request}    req                 The request object
     * @param  {Response}   res                 The response object
     * @param  {Function}   callback            Standard callback function
     * @param  {Error}      callback.error      The thrown error
     * @param  {String}     callback.template   The HTML dump of the navigation template
     */
    that.getContent = function(req, res, callback) {

        // Create some parameters to pass to the template
        var navigationOptions = {
            'currentNode': libutil.getCurrentNode(req),
            'nodes': config.nodes
        }

        // Render the navigation partial
        res.render('partials/globals/navigation', navigationOptions, function(error, template) {
            if (error) {
                return callback(error);
            }
            return callback(null, template);
        });
    };
};
