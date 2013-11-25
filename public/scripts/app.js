define([
    'jquery',
    'lodash'
], function ($, _) {
    'use strict';

    var App = function () {};
    _.extend(App.prototype, {
        'initialize': function () {
            var page = $('body').data('page');
            // Pages which have js functionality:
            var pages = [
                'find-a-library',
                'using-our-libraries',
                'library-profile'
            ];
            // If the page has js associated with it, fetch the appropriate file
            if (pages.indexOf(page) >= 0) {
                require(['view/page/' + page], function (Page) {
                    new Page();
                });
            }
        }
    });

    return App;
});
