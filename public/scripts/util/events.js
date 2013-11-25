define([
    'lodash'
], function (_) {
    'use strict';
    return {
        'on': function (event, callback) {
            this.events || (this.events = {});
            var callbacks = this.events[event] || (this.events[event] = []);
            callbacks.push(callback);
        },

        'off': function (event, callback) {
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

        'trigger': function (event) {
            if (this.events && this.events[event]) {
                _.invoke(this.events[event], 'apply', this, _.rest(arguments));
            }
        }
    };
});
