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

define([
    'jquery',
    'lodash',
    'config'
], function($, _, config) {
    'use strict';

    var App = function() {};
    _.extend(App.prototype, {
        'initialize': function() {
            var page = $('body').data('page');
            // If the page has js associated with it, fetch the appropriate file
            if (config.pages.indexOf(page) >= 0) {
                require(['view/page/' + page], function(Page) {
                    new Page();
                });
            }
        }
    });

    return App;
});
