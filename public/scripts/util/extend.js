define([
    'lodash'
], function (_) {
    'use strict';
    // Strongly based on the extend function from Backbone.js:

    // Helper function to correctly set up the prototype chain, for subclasses.
    // Similar to `goog.inherits`, but uses a hash of prototype properties and
    // class properties to be extended.
    return {
        'extend': function (protoProps) {
            var parent = this;
            var child = function () {
                return parent.apply(this, arguments);
            };

            _.extend(child, parent);

            // Set the prototype chain to inherit from `parent`, without calling
            // `parent`'s constructor function.
            var Surrogate = function () {
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
