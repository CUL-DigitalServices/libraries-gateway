define([
    'lodash',
    'jquery',
    'config',
    'view/search-type-selector',
    'bootstrap-collapse'
], function(_, $, config, TypeSelector) {
    'use strict';

    var ResultsPage = function() {
        this.initialize();
    };
    _.extend(ResultsPage.prototype, {
        'initialize': function() {
            _.bindAll(this);
            this.typeSelector = new TypeSelector();
            this.collapseHiddenFacets();
            this.bindEvents();
        },

        'collapseHiddenFacets': function() {
            var hiddenFacets = this.getHiddenFacetsData();
            var currentSearchData = this.getSearchData();
            // If the saved search is the same as the current one we can collapse the facets
            if (hiddenFacets && hiddenFacets.api === currentSearchData.api && hiddenFacets.keyword === currentSearchData.keyword) {
                _.each(hiddenFacets.facets, function(facetId) {
                    var $element = $('#' + facetId);
                    var $link = $('[href="#' + facetId + '"]');
                    $element.collapse('hide');
                    $link.addClass('collapsed');
                });
            } else {
                // Otherwise the saved hiddenFacets should be reset
                this.removeHiddenFacetsData();
            }
        },

        'bindEvents': function() {
            var $facets = $('.js-facet');
            $facets.on('show.bs.collapse', this.onFacetShow);
            $facets.on('hide.bs.collapse', this.onFacetHide);
        },

        'getSearchData': function() {
            // Return the used search api and keyword saved in the DOM
            if (!this.searchData) {
                var $results = $('.js-search-results');
                this.searchData = {
                    'api': $results.data('api'),
                    'keyword': $results.data('keyword')
                };
            }
            return this.searchData;
        },

        'getHiddenFacetsData': function() {
            var data = localStorage.getItem(config.localStorage.facetCollapse);
            return JSON.parse(data);
        },

        'setHiddenFacetsData': function(facets) {
            var data = JSON.stringify(_.extend(this.getSearchData(), {
                'facets': facets
            }));

            // Try catch to handle safari private browsing mode
            try {
                localStorage.setItem(config.localStorage.facetCollapse, data);
            } catch(error) {}
        },

        'removeHiddenFacetsData': function() {
            localStorage.removeItem(config.localStorage.facetCollapse);
        },

        'onFacetShow': function(event) {
            var hiddenFacets = this.getHiddenFacetsData().facets;
            var facetId = $(event.currentTarget).attr('id');
            this.setHiddenFacetsData(_.without(hiddenFacets, facetId));
        },

        'onFacetHide': function(event) {
            var hiddenFacetsData = this.getHiddenFacetsData();
            var hiddenFacets = [];
            if (hiddenFacetsData && hiddenFacetsData.facets) {
                hiddenFacets = hiddenFacetsData.facets;
            }

            var facetId = $(event.currentTarget).attr('id');
            if (hiddenFacets.indexOf(facetId) < 0) {
                hiddenFacets.push(facetId);
                this.setHiddenFacetsData(hiddenFacets);
            }
        }
    });

    return ResultsPage;
});
