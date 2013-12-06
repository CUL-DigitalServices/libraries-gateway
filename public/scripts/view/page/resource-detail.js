define([
    'jquery',
    'lodash'
], function ($, _) {
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
