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

define([], function() {
    'use strict';
    return {
        'constants': {
            'milesToMetres': 1609.344,
            'streetViewRadius': 50
        },
        'imagePaths': {
            'directionsMarker': '/public/images/directions-icon.png'
        },
        'localStorage': {
            'facetCollapse': 'cambridge_libraries_hidden_facets'
        },
        'pages': [
            'find-a-library',
            'find-a-resource',
            'find-a-resource-results',
            'library-profile',
            'resource-detail',
            'using-our-libraries'
        ]
    };
});
