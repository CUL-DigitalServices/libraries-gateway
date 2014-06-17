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
    'lodash'
], function($, _) {
    'use strict';
    var ResourceDetailPage = function() {
        this.initialize();
    };
    _.extend(ResourceDetailPage.prototype, {
        'initialize': function() {
            this.bindEvents();
        },

        'bindEvents': function() {
            $('.js-btn-print').on('click', this.onPrintClick);
        },

        'onPrintClick': function(event) {
            event.preventDefault();
            window.print();
        }
    });
    return ResourceDetailPage;
});
