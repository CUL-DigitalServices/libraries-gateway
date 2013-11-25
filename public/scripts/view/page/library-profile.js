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
            var $mapsContainer = $('.js-maps-container');
            var lat = $mapsContainer.data('lat');
            var lng = $mapsContainer.data('lng');
            var marker = this.marker = new Marker(lat, lng);
            marker.drop();
        }
    });

    return LibraryProfilePage;
});
