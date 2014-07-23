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

var config = require('../../../config');
var log = require('../../util/logger').logger();
var libutil = require('../../util/util');

/**
 * Constructor
 */
var BaseViewController = module.exports.BaseViewController = function() {
    var that = this;

    /**
     * Function that renders the viewcontroller's template into the index template
     *
     * @param  {Request}    req             The request object
     * @param  {Response}   res             The response object
     * @param  {Object }    data            The data that needs to be displayed on the template partial
     * @param  {String}     template        The template that needs to be rendered into the index template
     * @param  {String}     templateID      The template identifier
     */
    that.renderTemplate = function(req, res, data, template, templateID) {

        // Create a parameters object for the partial template
        var parameters = {
            'data': data,
            'settings': {
                'currentNode': libutil.getCurrentNode(req),
                'nodes': config.nodes,
                'title': config.app.title,
            }
        };

        // Check if the page title is specified
        if (data && data.pageTitle) {
            parameters.data.pageTitle = data.pageTitle;
        }

        // Render the node template (e.g. home, my-account...)
        res.render(template, parameters, function(err, tplBody) {
            if (err) {
                log().error({'err': err, 'template': template, 'parameters': parameters}, 'Error while rendering the node template');
                return res.send(500, 'Error while rendering the node template');
            }

            // Initialize some parameters to pass to the template body
            parameters = {
                'partials': {
                    'body': tplBody
                },
                'settings': {
                    'id': templateID,
                    'title': config.app.title
                }
            };

            // Render the index template
            return res.render('index', parameters, function(err, tplIndex) {
                if (err) {
                    log().error({'err': err, 'parameters': parameters}, 'Error while rendering the index template');
                    return res.send(500, 'Error while rendering the index template');
                }
                return res.send(200, tplIndex);
            });
        });
    };
};
