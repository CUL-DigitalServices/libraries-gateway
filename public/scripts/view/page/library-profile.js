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
    'jquery',
    'lodash',
    'view/map',
    'view/marker'
], function($, _, map, Marker) {
    'use strict';

    var LibraryProfilePage = function() {
        this.initialize();
    };
    _.extend(LibraryProfilePage.prototype, {
        'initialize': function() {
            _.bindAll(this);
            var self = this;
            var $mapsContainer = $('.js-maps-container');
            var lat = $mapsContainer.data('lat');
            var lng = $mapsContainer.data('lng');
            var marker = this.marker = new Marker(lat, lng);
            this.latLng = new google.maps.LatLng(lat, lng);
            marker.drop();
            this.bindEvents();

            map.locateCurrentPosition(function(error) {
                if (!error) {
                    $('.js-btn-directions').removeClass('hidden');
                }
            });

            map.getPanormaForLocation(lat, lng, function(error, data) {
                if (!error) {
                    self.panoramaLocation = data.location.latLng;
                    $('.js-btn-street-view').removeClass('hidden');
                }
            });
        },

        'bindEvents': function() {
            $('.js-btn-street-view').on('click', this.onStreetViewClick);
            $('.js-btn-directions').on('click', this.onDirectionsClick);
        },

        'onStreetViewClick': function() {
            map.openStreetViewAt(this.panoramaLocation);
        },

        'onDirectionsClick': function() {
            map.closeStreetView();
            map.showDirectionsTo(this.latLng);
        }
    });

    return LibraryProfilePage;
});
