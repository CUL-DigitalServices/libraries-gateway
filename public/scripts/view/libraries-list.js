define([
    'jquery',
    'lodash',
    'util/events',
    'util/api',
    'view/library',
    'model/library-model'
], function ($, _, events, api, Library, LibraryModel) {
    'use strict';

    var LibrariesList = function (options) {
        this.$el = $(options.el);
        this.initialize();
    };
    _.extend(LibrariesList.prototype, {
        initialize: function () {
            _.bindAll(this);
            this.fetchLibraries();
        },

        fetchLibraries: function () {
            this.libraries || (this.libraries = []);
            var self = this;
            api.getLibraries().then(function (libData) {
                _.each(libData, function (library) {
                    var model = new LibraryModel(library);
                    self.libraries.push(model);
                    self.addLibraryView(model);
                    model.on('change:active', self.onActiveChange);
                });
            });
        },

        addLibraryView: function (libraryModel) {
            if (libraryModel.get('latlng')) {
                var library = new Library({
                    model: libraryModel
                });
                this.$el.append(library.render().$el);
            } else {
                // Temporary until data is complete
                libraryModel.off();
                this.libraries = _.without(this.libraries, libraryModel);
            }
        },

        unselect: function () {
            var activeLibrary = _.find(this.libraries, function (library) {
                return library.get('active') === true;
            });
            if (activeLibrary) {
                activeLibrary.set('active', false);
            }
        },

        onActiveChange: function (model, active) {
            if (active === true) {
                // Set all other models their active attribute to false
                _.invoke(_.without(this.libraries, model), 'set', 'active', false);
                this.scrollToActiveItem();
            }
        },

        filter: function (filters) {
            var passed = this.libraries,
                failed;
            _.each(filters, function (filter) {
                passed = _.filter(passed, filter);
            });
            failed = _.difference(this.libraries, passed);

            _.invoke(passed, 'set', 'visible', true);
            _.invoke(failed, 'set', 'visible', false);

            this.scrollToActiveItem();
        },

        scrollToActiveItem: function () {
            var $active = this.$el.find('.active');
            if ($active.length) {
                this.scrollToTarget($active);
            }
        },

        scrollToTarget: function ($target) {
            var listOffset = this.$el.offset().top,
                listScrollTop = this.$el.scrollTop(),
                listHeight = this.$el.height(),

                targetOffset = $target.offset().top,
                targetHeight = $target.outerHeight(),

                scrollOffset = listScrollTop - listOffset + 1;
            // Check whether the target is already visible in the lists' scroll area.
            if (targetOffset < listOffset || (targetOffset + targetHeight) > (listOffset + listHeight)) {
                this.$el.animate({
                    scrollTop: $target.offset().top + scrollOffset
                });
            }
        }
    }, events);

    return LibrariesList;
});
