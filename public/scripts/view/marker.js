define([
    'util/events',
    'view/map'
], function (events, map) {
    'use strict';

    var Marker = function () {
        this.initialize.apply(this, arguments);
    };
    _.extend(Marker.prototype, {
        initialize: function (lat, lng, title) {
            _.bindAll(this);
            var latLng = new google.maps.LatLng(lat, lng);
            this.marker = new google.maps.Marker({
                map: map.getGoogleMap(),
                position: latLng,
                title: title,
                visible: false
            });
            this.bindEvents();
        },

        bindEvents: function () {
            google.maps.event.addListener(this.marker, 'click', this.onMarkerClick);
        },

        onMarkerClick: function () {
            this.trigger('click');
        },

        drop: function () {
            var marker = this.marker;
            setTimeout(function () {
                marker.setOptions({
                    visible: true,
                    animation: google.maps.Animation.DROP
                });
            }, _.random(0, 1000));
        },

        hide: function () {
            this.marker.setVisible(false);
        },

        show: function () {
            this.marker.setVisible(true);
        },

        startBounce: function () {
            this.marker.setAnimation(google.maps.Animation.BOUNCE);
        },

        stopBounce: function () {
            this.marker.setAnimation(null);
        }
    }, events);

    return Marker;
});
