require.config({
    'paths': {
        'jquery': '../components/jquery/jquery',
        'lodash': '../components/lodash/dist/lodash',
        'async': '../components/requirejs-plugins/src/async',
        'text': '../components/requirejs-text/text',
        'bootstrap-collapse': '../components/bootstrap/js/collapse',
        'bootstrap-dropdown': '../components/bootstrap/js/dropdown',
        'bootstrap-tab': '../components/bootstrap/js/tab',
        'bootstrap-transition': '../components/bootstrap/js/transition',
        'projectLight': '../components/project-light/javascripts/custom',
        'modernizr': '../components/modernizr/modernizr'
    },
    'shim': {
        'projectLight': {
            'deps': [
                'jquery',
                'modernizr'
            ]
        },
        'bootstrap-collapse': {
            'deps': [
                'bootstrap-transition'
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
