define([
    'lodash',
    'jquery',
    'view/dropdown-selector'
], function(_, $, DropdownSelector) {
    'use strict';

    var TypeSelector = function() {
        this.initialize();
    };

    _.extend(TypeSelector.prototype, {
        'initialize': function() {
            this.selector = new DropdownSelector({
                'el': '.js-type-dropdown'
            });
            this.bindEvents();
        },

        'bindEvents': function() {
            this.selector.on('change', this.onTypeChanged);
        },

        'onTypeChanged': function(value) {
            $('.js-type-input').val(value);
        }
    });

    return TypeSelector;
});
