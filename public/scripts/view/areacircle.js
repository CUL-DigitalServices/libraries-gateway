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
    'jquery',
    'lodash',
    'util/events',
    'view/map'
], function($, _, events, map) {
    'use strict';

    var AreaCircle = function() {};
    _.extend(AreaCircle.prototype, {
        'initialize': function() {
            _.bindAll(this);
            var self = this;
            map.locateCurrentPosition(function(error, latLng) {
                if (error) {
                    return;
                }

                // Once the users position is found initialize the circle on the
                // map.
                self.circle = new google.maps.Circle({
                    'map': map.getGoogleMap(),
                    'center': latLng,
                    'clickable': false,
                    'radius': 1000,
                    'strokeColor': '#0000FF',
                    'strokeOpacity': 0.4,
                    'strokeWeight': 1,
                    'fillColor': '#0000FF',
                    'fillOpacity': 0.07,
                    'visible': false
                });
            });
        },

        'setRadius': function(radius) {
            this.circle.setRadius(radius);
        },

        'show': function() {
            this.circle.setVisible(true);
        },

        'hide': function() {
            this.circle.setVisible(false);
        },

        'latLngInArea': function(lat, lng) {
            var latLng = new google.maps.LatLng(lat, lng);
            var bounds = this.circle.getBounds();
            return bounds.contains(latLng);
        }
    }, events);

    return new AreaCircle();
});
