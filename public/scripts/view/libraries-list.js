define([
    'jquery',
    'lodash',
    'util/events',
    'util/api',
    'view/library',
    'model/library-model'
], function($, _, events, api, Library, LibraryModel) {
    'use strict';

    var LibrariesList = function(options) {
        this.$el = $(options.el);
        this.initialize();
    };
    _.extend(LibrariesList.prototype, {
        'initialize': function() {
            _.bindAll(this);
            this.populate();
        },

        'populate': function() {
            this.libraries || (this.libraries = []);
            var self = this;
            var libData = JSON.parse(this.$el.data('libraries'));

            _.each(libData, function(library) {
                var model = new LibraryModel(library);
                self.libraries.push(model);
                self.addLibraryView(model);
                model.on('change:active', self.onActiveChange);
            });
        },

        'addLibraryView': function(libraryModel) {
            if (libraryModel.get('coords')) {
                var library = new Library({
                    'model': libraryModel
                });
                this.$el.append(library.render().$el);
            } else {
                // Temporary until data is complete
                libraryModel.off();
                this.libraries = _.without(this.libraries, libraryModel);
            }
        },

        // Remove the active state from whichever library is currently activated
        'unselect': function() {
            var activeLibrary = _.find(this.libraries, function(library) {
                return library.get('active') === true;
            });
            if (activeLibrary) {
                activeLibrary.set('active', false);
            }
        },

        'onActiveChange': function(model, active) {
            if (active === true) {
                // Set all other models their active attribute to false
                _.invoke(_.without(this.libraries, model), 'set', 'active', false);
                this.scrollToActiveItem();
            }
        },

        'filter': function(filters) {
            var passed = this.libraries;
            var failed;
            // Apply all filters to the libraries array
            _.forEach(filters, function(filter) {
                passed = _.filter(passed, filter.fn);
            });
            // Also save which libraries were filtered out
            failed = _.difference(this.libraries, passed);

            _.invoke(passed, 'set', 'visible', true);
            _.invoke(failed, 'set', 'visible', false);
            // Keep the active item visible in the list by keeping it in the
            // lists visible scroll area.
            this.scrollToActiveItem();
        },

        'scrollToActiveItem': function() {
            var $active = this.$el.find('.active');
            if ($active.length) {
                this.scrollToTarget($active);
            }
        },

        'scrollToTarget': function($target) {
            var listOffset = this.$el.offset().top;
            var listScrollTop = this.$el.scrollTop();
            var listHeight = this.$el.height();

            var targetOffset = $target.offset().top;
            var targetHeight = $target.outerHeight();

            var scrollOffset = listScrollTop - listOffset + 1;
            // Don't trigger the scroll if the item is already in the lists'
            // visible scroll area.
            if (targetOffset < listOffset || (targetOffset + targetHeight) > (listOffset + listHeight)) {
                this.$el.animate({
                    'scrollTop': $target.offset().top + scrollOffset
                });
            }
        }
    }, events);

    return LibrariesList;
});
