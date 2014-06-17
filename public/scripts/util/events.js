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
    'lodash'
], function(_) {
    'use strict';
    return {
        'on': function(event, callback) {
            this.events || (this.events = {});
            var callbacks = this.events[event] || (this.events[event] = []);
            callbacks.push(callback);
        },

        'off': function(event, callback) {
            if (!this.events) {
                return;
            } else if (!event) {
                delete this.events;
            } else if (!callback) {
                delete this.events[event];
            } else {
                this.events[event] = _.without(this.events[event], callback);
            }
        },

        'trigger': function(event) {
            if (this.events && this.events[event]) {
                _.invoke(this.events[event], 'apply', this, _.rest(arguments));
            }
        }
    };
});
