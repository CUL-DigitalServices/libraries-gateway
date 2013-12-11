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
        'directionsEnabled': false,

        'initialize': function() {
            _.bindAll(this);
            this.infoWindow = new google.maps.InfoWindow({
                // This is to have the window float above the marker
                'pixelOffset': new google.maps.Size(0, -38),
                disableAutoPan: true
            });
            google.maps.event.addListener(this.infoWindow, 'closeclick', this.onWindowClose);
        },

        'onWindowClose': function() {
            this.trigger('close');
        },

        'open': function(libraryModel) {
            var self = this;
            var coords = libraryModel.get('coords');
            var latLng = new google.maps.LatLng(coords.lat, coords.lng);
            this.model = libraryModel;

            libraryModel.fetchPanoramaLatLng(function(error, panoramaLatLng) {
                self.render();
                self.infoWindow.setPosition(latLng);
                self.infoWindow.open(map.getGoogleMap());
                map.panTo(latLng);
            });
        },

        'render': function() {
            var templateData = this.model.toJSON();
            var panoramaLatLng = this.model.get('panoramaLatLng');
            templateData.directionsEnabled = this.directionsEnabled;
            templateData.streetViewEnabled = (panoramaLatLng !== undefined);
            google.maps.event.addListenerOnce(this.infoWindow, 'domready', this.onDomReady);
            this.infoWindow.setContent(this.template(templateData));
        },

        'enableDirections': function() {
            this.directionsEnabled = true;
            if (this.model) {
                this.render();
            }
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
            var streetViewLatLng = this.model.get('panoramaLatLng');
            map.openStreetViewAt(streetViewLatLng);
        }
    }, events);
    return new LibraryInfoWindow();
});
