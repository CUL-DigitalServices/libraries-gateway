define([
    'lodash',
    'view/libraries-list',
    'view/filters',
    'view/library-infowindow'
], function (_, LibrariesList, Filters, infoWindow) {
    'use strict';
    var MapPage = function () {
        this.initialize();
    };
    _.extend(MapPage.prototype, {
        'initialize': function () {
            _.bindAll(this);
            this.list = new LibrariesList({
                'el': '.js-libraries'
            });
            this.filters = new Filters();
            this.bindEvents();
        },

        'bindEvents': function () {
            this.filters.on('change', this.onFiltersChange);
            infoWindow.on('close', this.onInfoWindowClose);
        },

        'onInfoWindowClose': function () {
            // Remove the active state from all list items
            this.list.unselect();
        },

        'onFiltersChange': function (filters) {
            this.list.filter(filters);
        }
    });
    return MapPage;
});
