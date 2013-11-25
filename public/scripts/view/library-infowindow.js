define([
    'jquery',
    'lodash',
    'util/events',
    'view/map',
    'text!../../templates/library-info.html'
], function($, _, events, map, template) {
    'use strict';
    var LibraryInfoWindow = function() {
        this.initialize();
    };
    _.extend(LibraryInfoWindow.prototype, {
        'template': _.template(template),

        'initialize': function() {
            _.bindAll(this);
            this.infoWindow = new google.maps.InfoWindow({
                // This is to have the window float above the marker
                'pixelOffset': new google.maps.Size(0, -38)
            });
            google.maps.event.addListener(this.infoWindow, 'closeclick', this.onWindowClose);
        },

        'onWindowClose': function() {
            this.trigger('close');
        },

        'open': function(libraryModel) {
            var infoWindow = this.infoWindow;
            var coords = libraryModel.getLatLng();
            var latLng = new google.maps.LatLng(coords.lat, coords.lng);
            map.panTo(latLng);
            google.maps.event.addListenerOnce(infoWindow, 'domready', this.onDomReady);
            infoWindow.setContent(this.template(libraryModel.toJSON()));
            infoWindow.setPosition(latLng);
            infoWindow.open(map.getGoogleMap());
        },

        'onDomReady': function() {
            this.resetEvents();
        },

        'resetEvents': function() {
            this.removeListeners();
            this.bindEvents();
        },

        // Remove each event listener applied to the window's content. We need
        // this when the content of the infoWindow is being replaced.
        'removeListeners': function() {
            var listeners = this.listeners;
            while (listeners && listeners.length) {
                google.maps.event.removeListener(listeners.pop());
            }
        },

        'bindEvents': function() {
            // Keep track of the event listeners so we can remove then later.
            var listeners = this.listeners || (this.listeners = []);
            listeners.push(google.maps.event.addDomListener($('.js-btn-directions')[0], 'click', this.onDirectionsClick));
            listeners.push(google.maps.event.addDomListener($('.js-btn-street-view')[0], 'click', this.onStreetViewClick));
        },

        'close': function() {
            this.infoWindow.close();
        },

        'onDirectionsClick': function() {
            map.showDirectionsTo(this.infoWindow.getPosition());
            this.close();
        },

        'onStreetViewClick': function() {
            map.openStreetViewAt(this.infoWindow.getPosition());
        }
    }, events);
    return new LibraryInfoWindow();
});
