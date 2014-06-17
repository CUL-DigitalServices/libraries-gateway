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
    // Strongly based on the extend function from Backbone.js:

    // Helper function to correctly set up the prototype chain, for subclasses.
    // Similar to `goog.inherits`, but uses a hash of prototype properties and
    // class properties to be extended.
    return {
        'extend': function(protoProps) {
            var parent = this;
            var child = function() {
                return parent.apply(this, arguments);
            };

            _.extend(child, parent);

            // Set the prototype chain to inherit from `parent`, without calling
            // `parent`'s constructor function.
            var Surrogate = function() {
                this.constructor = child;
            };

            Surrogate.prototype = parent.prototype;
            child.prototype = new Surrogate();

            // Add prototype properties (instance properties) to the subclass,
            // if supplied.
            if (protoProps) {
                _.extend(child.prototype, protoProps);
            }

            // Set a convenience property in case the parent's prototype is needed
            // later.
            child.__super__ = parent.prototype;

            return child;
        }
    };
});
