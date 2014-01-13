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
