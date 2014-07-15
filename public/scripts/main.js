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

require.config({
    'paths': {
        'async': '../components/requirejs-plugins/src/async',
        'bootstrap-collapse': '../components/bootstrap/js/collapse',
        'bootstrap-dropdown': '../components/bootstrap/js/dropdown',
        'bootstrap-transition': '../components/bootstrap/js/transition',
        'history': '../components/history.js/scripts/bundled-uncompressed/html4+html5/jquery.history',
        'jquery': '../components/jquery/jquery',
        'lodash': '../components/lodash/dist/lodash',
        'modernizr': '../components/modernizr/modernizr',
        'projectLight': '../components/project-light/javascripts/custom',
        'text': '../components/requirejs-text/text'
    },
    'shim': {
        'bootstrap-collapse': {
            'deps': [
                'bootstrap-transition'
            ]
        },
        'history': {
            'exports': 'History'
        },
        'modernizr': {
            'exports': 'Modernizr'
        },
        'projectLight': {
            'deps': [
                'jquery',
                'modernizr'
            ]
        }
    }
});

define([
    'app',
    'projectLight'
], function(App) {
    'use strict';
    (new App()).initialize();
});
