define([
    'jquery',
    'lodash',
    'config',
    'util/events',
    'view/dropdown-selector',
    'view/areacircle',
], function($, _, config, events, DropdownSelector, areaCircle) {
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
            this.alphabetFilter.on('change', this.onAlphabetFilterChange);
            $('.js-mini-search').on('keyup', this.onSearchKeyUp);
        },

        'enableAreaFilter': function() {
            areaCircle.initialize();
            this.areaFilter.$el.removeClass('hidden');
            this.areaFilter.on('change', this.onAreaFilterChange);
            this.onAreaFilterChange();
        },

        'onAreaFilterChange': function() {
            var value = this.areaFilter.getValue();
            var filter;
            if (value) {
                // Convert miles to meters
                areaCircle.setRadius(value * config.constants.milesToMetres);
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
            this.setFilter('area', filter, value);
        },

        'onAlphabetFilterChange': function() {
            var value = this.alphabetFilter.getValue();
            var filter;
            if (value) {
                filter = function(library) {
                    return library.get('name')[0].toLowerCase() === value;
                };
            }
            this.setFilter('alphabet', filter, value);
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
            this.setFilter('keyword', filter, keyword);
        },

        'setFilter': function(filterName, fn, value) {
            // Initialize the filters object if it doesn't exist yet.
            var filters = this.filters || (this.filters = {});
            // Overwrite the exisiting filter if a function is provided,
            // otherwise delete the filter.
            if (fn) {
                filters[filterName] = {
                    'fn': fn,
                    'value': value
                };
            } else {
                delete filters[filterName];
            }
            this.trigger('change', filters);
        },

        'setFilterValues': function(filters) {
            var keyword = filters.keyword;
            var alphabet = filters.alphabet;
            var area = filters.area;

            if (keyword) {
                $('.js-mini-search').val(keyword);
                this.setKeyword(keyword);
            }

            if (alphabet) {
                this.alphabetFilter.selectValue(alphabet);
            }

            if (area) {
                this.areaFilter.selectValue(area);
            }
        },

        'getFilters': function() {
            return this.filters;
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
