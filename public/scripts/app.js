define([
    'jquery',
    'lodash'
], function ($, _) {
    'use strict';

    var App = function () {};
    _.extend(App.prototype, {
        initialize: function () {
            var page = $('body').data('page'),
                jsPath;
            // Map body classname to js file
            switch (page) {
            case 'find-a-library':
                jsPath = 'find-a-library';
                break;
            case 'using-our-libraries':
                jsPath = 'using-our-libraries';
                break;
            case 'library-profile':
                jsPath = 'library-profile'
                break;
            }
            // If a path is set, fetch the js
            if (jsPath) {
                require(['view/page/' + jsPath], function (Page) {
                    new Page();
                });
            }
        }
    });

    return App;
});
