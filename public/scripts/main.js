require.config({
    paths: {
        jquery: '../components/jquery/jquery',
        lodash: '../components/lodash/dist/lodash',
        async: '../components/requirejs-plugins/src/async',
        text: '../components/requirejs-text/text',
        'bootstrap-dropdown': '../components/bootstrap/js/dropdown',
        projectLight: '../components/project-light/javascripts/custom',
        modernizr: '../components/modernizr/modernizr'
    },
    shim: {
        projectLight: {
            deps: [
                'jquery',
                'modernizr'
            ]
        }
    }
});

define([
    'app',
    'projectLight'
], function (App) {
    'use strict';
    (new App()).initialize();
});
