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
