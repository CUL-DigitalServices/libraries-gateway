define([
    'jquery'
], function ($) {
    'use strict';
    return {
        getLibraries: function () {
            return $.ajax({
                url: 'http://localhost:5000/api/libraries'
            });
        }
    };
});
