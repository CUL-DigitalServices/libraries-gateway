define([
    'jquery',
    'lodash',
    'async!//maps.googleapis.com/maps/api/js?key=AIzaSyAiUCMI-eafvJOepvdC0TXXFGHQ0NUYVC4&sensor=true'
], function ($, _) {
    'use strict';

    var Map = function () {
        this.initialize();
    };
    _.extend(Map.prototype, {
        initialize: function () {
            _.bindAll(this);
            this.initializeMap();
            this.initializeDirections();
        },

        initializeMap: function () {
            this.map = new google.maps.Map($('.js-maps-container')[0], {
                center: new google.maps.LatLng(52.20534, 0.12182),
                zoom: 14,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                disableDefaultUI: true
            });
        },

        getGoogleMap: function () {
            return this.map;
        },

        initializeDirections: function () {
            this.directionsService = new google.maps.DirectionsService();
            this.directionsRenderer = new google.maps.DirectionsRenderer({
                map: this.map,
                suppressInfoWindows: true,
                markerOptions: {
                    icon: 'images/directions-icon.png'
                }
            });
        },

        closeStreetView: function () {
            var streetView = this.map.getStreetView();
            if (streetView.getVisible()) {
                streetView.setVisible(false);
            }
        },

        locateCurrentPosition: (function () {
            var latLng;
            return function (callback, cached) {
                if ((!latLng || cached === false) && navigator.geolocation) {
                    var options = {
                        enableHighAccuracy: true
                    };

                    navigator.geolocation.getCurrentPosition(function (position) {
                        var lat = position.coords.latitude,
                            lng = position.coords.longitude;
                        latLng = new google.maps.LatLng(lat, lng);
                        callback(latLng);
                    }, function () {
                        console.log('geolocation error');
                    }, options);
                } else {
                    callback(latLng);
                }
            };
        })(),

        panTo: function (latLng) {
            this.closeStreetView();
            this.map.panTo(latLng);
        },

        openStreetViewAt: function (latLng) {
            var streetView = this.map.getStreetView();
            streetView.setPosition(latLng);
            streetView.setVisible(true);
        },

        showDirectionsTo: function (latLng) {
            var self = this;
            this.locateCurrentPosition(function (position) {
                var requestData = {
                    origin: position,
                    destination: latLng,
                    travelMode: google.maps.TravelMode.WALKING
                };
                self.directionsService.route(requestData, function (result, status) {
                    if (status === google.maps.DirectionsStatus.OK) {
                        self.directionsRenderer.setDirections(result);
                    }
                });
            });
        }
    });

    return new Map();
});
