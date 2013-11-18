define([
    'jquery'
], function ($) {
    'use strict';
    return {
        getLibraries: function () {
            return $.ajax({
                url: 'http://localhost:1234/api/libraries'
            });
        }
    };
});
