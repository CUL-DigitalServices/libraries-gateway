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
    'config',
    'async!//maps.googleapis.com/maps/api/js?key=AIzaSyAiUCMI-eafvJOepvdC0TXXFGHQ0NUYVC4&sensor=true'
], function($, _, config) {
    'use strict';

    var Map = function() {
        this.initialize();
    };
    _.extend(Map.prototype, {
        'initialize': function() {
            _.bindAll(this);
            this.initializeMap();
            this.initializeDirections();
            this.initializeStreetView();
        },

        'initializeMap': function() {
            var $el = $('.js-maps-container');
            var lat = $el.data('lat') || 52.20534;
            var lng = $el.data('lng') || 0.12182;
            var zoom = $el.data('zoom') || 14;

            this.map = new google.maps.Map($('.js-maps-container')[0], {
                'center': new google.maps.LatLng(lat, lng),
                'zoom': zoom,
                'mapTypeId': google.maps.MapTypeId.ROADMAP,
                'disableDefaultUI': true
            });
        },

        'getGoogleMap': function() {
            return this.map;
        },

        'initializeDirections': function() {
            this.directionsService = new google.maps.DirectionsService();
            this.directionsRenderer = new google.maps.DirectionsRenderer({
                'map': this.map,
                'suppressInfoWindows': true,
                'markerOptions': {
                    'icon': config.imagePaths.directionsMarker
                }
            });
        },

        'initializeStreetView': function() {
            this.streetViewService = new google.maps.StreetViewService();
        },

        'closeStreetView': function() {
            var streetView = this.map.getStreetView();
            if (streetView.getVisible()) {
                streetView.setVisible(false);
            }
        },

        'getPanormaForLocation': function(lat, lng, callback) {
            var latLng = new google.maps.LatLng(lat, lng);
            var radius = config.constants.streetViewRadius;
            this.streetViewService.getPanoramaByLocation(latLng, radius, function(data, status) {
                if (status === 'UNKNOWN_ERROR' || status === 'ZERO_RESULTS') {
                    callback('No results found for provided location.');
                } else {
                    callback(undefined, data);
                }
            });
        },

        'locateCurrentPosition': (function() {
            var latLng;
            return function(callback, cached) {
                if ((!latLng || cached === false) && navigator.geolocation) {
                    var options = {
                        'enableHighAccuracy': true
                    };

                    navigator.geolocation.getCurrentPosition(function(position) {
                        var lat = position.coords.latitude;
                        var lng = position.coords.longitude;
                        latLng = new google.maps.LatLng(lat, lng);
                        callback(null, latLng);
                    }, function(error) {
                        callback(error);
                    }, options);
                } else {
                    callback(null, latLng);
                }
            };
        })(),

        'panTo': function(latLng) {
            this.closeStreetView();
            this.map.panTo(latLng);
        },

        'openStreetViewAt': function(latLng) {
            var streetView = this.map.getStreetView();
            streetView.setPosition(latLng);
            streetView.setVisible(true);
        },

        'showDirectionsTo': function(latLng) {
            var self = this;
            this.locateCurrentPosition(function(error, position) {
                if (error) {
                    return;
                }

                var requestData = {
                    'origin': position,
                    'destination': latLng,
                    'travelMode': google.maps.TravelMode.WALKING
                };
                self.directionsService.route(requestData, function(result, status) {
                    // Todo: directions fallback
                    if (status === google.maps.DirectionsStatus.OK) {
                        self.directionsRenderer.setDirections(result);
                    }
                });
            });
        }
    });

    return new Map();
});
