define([
    'jquery'
], function ($) {
    'use strict';
    return {
        getLibraries: function () {
            return $.ajax({
                url: '/api/libraries'
            });
        }
    };
});
