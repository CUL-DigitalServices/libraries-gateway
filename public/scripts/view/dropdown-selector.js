define([
    'jquery',
    'lodash',
    'util/events',
    'bootstrap-dropdown'
], function($, _, events) {
    'use strict';

    var DropdownSelector = function(options) {
        if (options.el) {
            this.$el = $(options.el);
        }
        this.initialize();
    };

    _.extend(DropdownSelector.prototype, {
        'initialize': function() {
            _.bindAll(this);
            this.bindEvents();
        },

        'bindEvents': function() {
            this.$el.find('.js-option').on('click', this.onOptionClick);
        },

        'onOptionClick': function(event) {
            event.preventDefault();
            // Set the active value to the option which was clicked
            this.setValue($(event.currentTarget).data('value'), $(event.currentTarget).text());
        },

        'setValue': function(value, label) {
            if (this.getValue() !== value) {
                this.$el.find('.js-value').text(label).data('value', value);
                this.trigger('change', value, label);
            }
        },

        'selectValue': function(value) {
            var $option = this.$el.find('.js-option[data-value="' + value + '"]');
            $option.trigger('click');
        },

        'getValue': function() {
            return this.$el.find('.js-value').data('value');
        }
    }, events);

    return DropdownSelector;
});
