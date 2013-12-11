define([
    'lodash',
    'model/base-model',
    'view/map'
], function(_, BaseModel, map) {
    'use strict';

    var LibraryModel = BaseModel.extend({
        'fetchPanoramaLatLng': function(callback) {
            var self = this;
            var coords = this.get('coords');
            var panoramaLatLng = this.get('panoramaLatLng');
            var panoramaFetchError = this.panoramaFetchError;

            if (panoramaLatLng) {
                callback(undefined, panoramaLatLng);
            } else if (panoramaFetchError) {
                callback(panoramaFetchError);
            } else {
                map.getPanormaForLocation(coords.lat, coords.lng, function(error, panorama) {
                    if (error) {
                        self.panoramaFetchError = error;
                    } else {
                        self.set('panoramaLatLng', panorama.location.latLng);
                    }
                    self.fetchPanoramaLatLng(callback);
                });
            }
        }
    });

    return LibraryModel;
});
