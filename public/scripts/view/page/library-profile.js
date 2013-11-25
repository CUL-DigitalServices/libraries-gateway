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
            var $mapsContainer = $('.js-maps-container');
            var lat = $mapsContainer.data('lat');
            var lng = $mapsContainer.data('lng');
            var latLng = this.latLng = new google.maps.LatLng(lat, lng);
            var marker = this.marker = new Marker(lat, lng);
            marker.drop();

            this.bindEvents();
        },

        'bindEvents': function() {
            $('.js-btn-street-view').on('click', this.onStreetViewClick);
            $('.js-btn-directions').on('click', this.onDirectionsClick);
        },

        'onStreetViewClick': function() {
            map.openStreetViewAt(this.latLng);
        },

        'onDirectionsClick': function() {
            map.showDirectionsTo(this.latLng);
        }
    });

    return LibraryProfilePage;
});
