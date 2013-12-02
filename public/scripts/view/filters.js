define([
    'jquery',
    'lodash',
    'util/events',
    'view/dropdown-selector',
    'view/areacircle',
], function($, _, events, DropdownSelector, areaCircle) {
    'use strict';

    var LibrariesFilters = function() {
        this.initialize();
    };
    _.extend(LibrariesFilters.prototype, {
        'initialize': function() {
            _.bindAll(this);
            this.keyword = '';
            this.areaFilter = new DropdownSelector({
                'el': '.js-dropdown-selector-area'
            });
            this.alphabetFilter = new DropdownSelector({
                'el': '.js-dropdown-selector-alphabet'
            });
            this.bindEvents();
        },

        'bindEvents': function() {
            this.areaFilter.on('change', this.onAreaFilterChange);
            this.alphabetFilter.on('change', this.onAlphabetFilterChange);
            $('.js-mini-search').on('keyup', this.onSearchKeyUp);
        },

        'enableAreaFilter': function() {
            this.areaFilter.$el.removeClass('hidden');
        },

        'onAreaFilterChange': function() {
            var value = this.areaFilter.getValue();
            var filter;
            if (value !== 'anywhere') {
                // Convert miles to meters
                areaCircle.setRadius(value * 1609.344);
                areaCircle.show();
                filter = function(library) {
                    var coords = library.get('coords');
                    // check whether a library is within the bounds of the area
                    return areaCircle.latLngInArea(coords.lat, coords.lng);
                };
            } else {
                // The circle isn't visible if there's no area filter active
                areaCircle.hide();
            }
            this.setFilter('area', filter);
        },

        'onAlphabetFilterChange': function() {
            var value = this.alphabetFilter.getValue();
            var filter;
            if (value && value !== 'all') {
                filter = function(library) {
                    return library.get('name')[0].toLowerCase() === value;
                };
            }
            this.setFilter('alphabet', filter);
        },

        'onKeywordChange': function() {
            var keyword = this.getKeyword();
            var filter;
            if (keyword && keyword.length) {
                filter = function(library) {
                    // Go through the library object and check whether any of
                    // its attributes matches with the specified keyword
                    return _.some(_.values(library.attributes), function(value) {
                        if (_.isString(value)) {
                            return value.toLowerCase().indexOf(keyword.toLowerCase()) >= 0;
                        }
                    });
                };
            }
            this.setFilter('keyword', filter);
        },

        'setFilter': function(filterName, fn) {
            var filters = this.filters || (this.filters = {});
            fn ? filters[filterName] = fn : delete filters[filterName];
            this.trigger('change', filters);
        },

        'onFilterChange': function() {
            this.updateFilters();
            this.trigger('change', this.filters);
        },

        'onSearchKeyUp': function(event) {
            this.setKeyword($(event.currentTarget).val());
        },

        'getKeyword': function() {
            return this.keyword;
        },

        'setKeyword': function(keyword) {
            if (keyword !== this.keyword) {
                this.keyword = keyword;
                this.onKeywordChange();
                this.trigger('change', this.filters);
            }
        }
    }, events);

    return LibrariesFilters;
});
