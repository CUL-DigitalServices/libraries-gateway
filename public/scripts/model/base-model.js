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
    'lodash',
    'util/events',
    'util/extend'
], function(_, events, extend) {
    'use strict';
    var BaseModel = function(attributes) {
        var self = this;
        _.forIn(attributes, function(value, key) {
            self.set(key, value);
        });
    };
    _.extend(BaseModel.prototype, {
        'get': function(key) {
            return this.attributes[key];
        },

        'set': function(key, value) {
            this.attributes || (this.attributes = {});
            this.attributes[key] = value;
            this.trigger('change:' + key, this, value);
            this.trigger('change', this, value);
        },

        'toJSON': function() {
            return _.clone(this.attributes);
        }
    }, events);

    _.extend(BaseModel, extend);
    return BaseModel;
});
