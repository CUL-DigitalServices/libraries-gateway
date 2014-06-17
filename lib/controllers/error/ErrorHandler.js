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

var util = require('util');

var BaseViewController = require('../client/BaseViewController').BaseViewController;

/**
 * Constructor
 */
var ErrorHandler = module.exports.ErrorHandler = function() {
    ErrorHandler.super_.apply(this, arguments);
    var that = this;

    /**
     * Function that renders the error template
     *
     * @param  {Request}   req     The request object
     * @param  {Response}  res     The response object
     */
    that.getErrorPage = function(req, res) {

        // Since Express doesn't return a statusCode, we first check if the route is set to determine whether we should display a 404 error page or not
        if (!req.route) {
            return that.renderTemplate(req, res, null, 'errors/404', 'error-404');
        }

        // In any other case we display a 500 error page
        return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
    };
};

// Inherit from the BaseViewController
return util.inherits(ErrorHandler, BaseViewController);
