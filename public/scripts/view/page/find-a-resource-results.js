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
            _.each(this.getHiddenFacets(), function(facetId) {
                var $element = $('#' + facetId);
                var $link = $('[href="#' + facetId + '"]');
                $element.collapse('hide');
                $link.addClass('collapsed');
            });
        },

        'bindEvents': function() {
            var $facets = $('.js-facet');
            $facets.on('show.bs.collapse', this.onFacetShow);
            $facets.on('hide.bs.collapse', this.onFacetHide);
        },

        'getHiddenFacets': function() {
            var facets = localStorage.getItem(config.localStorage.facetCollapse);
            return JSON.parse(facets);
        },

        'setHiddenFacets': function(facets) {
            var facetsJSON = JSON.stringify(facets);
            // Try catch to handle safari private browsing mode
            try {
                localStorage.setItem(config.localStorage.facetCollapse, facetsJSON);
            } catch(error) {}
        },

        'onFacetShow': function(event) {
            var hiddenFacets = this.getHiddenFacets();
            var facetId = $(event.currentTarget).attr('id');
            this.setHiddenFacets(_.without(hiddenFacets, facetId));
        },

        'onFacetHide': function(event) {
            var hiddenFacets = this.getHiddenFacets() || [];
            var facetId = $(event.currentTarget).attr('id');
            if (hiddenFacets.indexOf(facetId) < 0) {
                hiddenFacets.push(facetId);
                this.setHiddenFacets(hiddenFacets);
            }
        }
    });

    return ResultsPage;
});
