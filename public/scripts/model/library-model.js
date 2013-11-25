define([
    'model/base-model'
], function(BaseModel) {
    'use strict';

    var LibraryModel = BaseModel.extend({
        'getLatLng': function() {
            var latLng = this.get('latlng').split(',');
            return {
                'lat': latLng[0],
                'lng': latLng[1]
            };
        }
    });

    return LibraryModel;
});
