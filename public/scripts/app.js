define([
    'jquery',
    'lodash',
    'config'
], function($, _, config) {
    'use strict';

    var App = function() {};
    _.extend(App.prototype, {
        'initialize': function() {
            var page = $('body').data('page');
            // If the page has js associated with it, fetch the appropriate file
            if (config.pages.indexOf(page) >= 0) {
                require(['view/page/' + page], function (Page) {
                    new Page();
                });
            }
        }
    });

    return App;
});
