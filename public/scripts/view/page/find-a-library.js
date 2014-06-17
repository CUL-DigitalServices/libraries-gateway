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
    'history',
    'view/map',
    'view/libraries-list',
    'view/filters',
    'view/library-infowindow'
], function(_, History, map, LibrariesList, Filters, infoWindow) {
    'use strict';
    var MapPage = function() {
        this.initialize();
    };
    _.extend(MapPage.prototype, {
        'initialize': function() {
            _.bindAll(this);

            var filters = this.filters = new Filters();
            this.list = new LibrariesList({
                'el': '.js-libraries'
            });
            this.bindEvents();
            this.updateFiltersFromUrl();

            map.locateCurrentPosition(function(error) {
                if (!error) {
                    infoWindow.enableDirections();
                    filters.enableAreaFilter();
                }
            });
        },

        'bindEvents': function() {
            this.filters.on('change', this.onFiltersChange);
            infoWindow.on('close', this.onInfoWindowClose);
            window.onbeforeunload = this.updateUrlWithFilters;
        },

        'onInfoWindowClose': function() {
            // Remove the active state from all list items
            this.list.unselect();
        },

        'onFiltersChange': function(filters) {
            this.list.filter(filters);
        },

        'updateFiltersFromUrl': function() {
            var state = History.getState();
            var filters = this.getQueryParametersFromUrl(state.cleanUrl);
            this.filters.setFilterValues(filters);
        },

        'getQueryParametersFromUrl': function(url) {
            var splitUrl = url.split(/\?/);
            var parameters;
            var parametersObj = {};
            if (splitUrl[1]) {
                parameters = splitUrl[1].split(/&/g);
                _.each(parameters, function(parameter) {
                    var split = parameter.split(/=/);
                    var key = split[0];
                    var value = split[1];
                    parametersObj[key] = decodeURIComponent(value);
                });
            }
            return parametersObj;
        },

        'updateUrlWithFilters': function() {
            var filters = this.filters.getFilters();
            var parameters = _.map(filters, function(filter, index) {
                return index + '=' + filter.value;
            });
            History.replaceState(null, null, '?' + parameters.join('&'));
        }
    });
    return MapPage;
});
