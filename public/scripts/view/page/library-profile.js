define([
    'lodash',
    'view/map',
    'view/marker'
], function (_, map, Marker) {
    'use strict';

    var LibraryProfilePage = function () {
        this.initialize();
    };
    _.extend(LibraryProfilePage.prototype, {
        initialize: function () {
            var $mapsContainer = $('.js-maps-container'),
                lat = $mapsContainer.data('lat'),
                lng = $mapsContainer.data('lng'),
                marker = this.marker = new Marker(lat, lng);
            marker.drop();
        }
    });

    return LibraryProfilePage;
});
