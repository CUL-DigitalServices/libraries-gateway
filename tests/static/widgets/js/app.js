/*!
 * Copyright 2014 Digital Services, University of Cambridge Licensed
 * under the Educational Community License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

$(function() {
    'use strict';

    var events = {
        on: function(event, callback) {
            this.events || (this.events = {});
            var callbacks = this.events[event] || (this.events[event] = []);
            callbacks.push(callback);
        },

        off: function(event, callback) {
            if (!this.events) {
                return;
            } else if (!event) {
                delete this.events;
            } else if (!callback) {
                delete this.events[event];
            } else {
                this.events[event] = _.without(this.events[event], callback);
            }
        },

        trigger: function(event) {
            if (this.events && this.events[event]) {
                _.invoke(this.events[event], 'apply', this, _.rest(arguments));
            }
        }
    };

    var DropdownSelector = function(options) {
        if (options.el) {
            this.$el = $(options.el);
        }
        this.initialize();
    };

    _.extend(DropdownSelector.prototype, {
        initialize: function() {
            _.bindAll(this);
            this.bindEvents();
        },

        bindEvents: function() {
            this.$el.find('.js-option').on('click', this.onOptionClick);
            this.$el.find('.js-remove').on('click', this.onRemoveClick);
        },

        onOptionClick: function(event) {
            event.preventDefault();
            // Set the active value to the option which was clicked
            this.setValue($(event.currentTarget).data('value'), $(event.currentTarget).text());
        },

        onRemoveClick: function(event) {
            this.setToDefault();
            event.stopPropagation();
        },

        setToDefault: function() {
            var $value = this.$el.find('.js-value');
            var defaultLabel = $value.data('default-label');
            $value.text(defaultLabel).data('value', null);
            this.hideRemoveBtn();
            this.trigger('change', null, defaultLabel);
        },

        hideRemoveBtn: function() {
            this.$el.find('.js-remove').addClass('hidden');
        },

        showRemoveBtn: function() {
            this.$el.find('.js-remove').removeClass('hidden');
        },

        setValue: function(value, label) {
            if (this.getValue() !== value) {
                this.$el.find('.js-value').text(label).data('value', value);
                this.showRemoveBtn();
                this.trigger('change', value, label);
            }
        },

        selectValue: function(value) {
            var $option = this.$el.find('.js-option[data-value="' + value + '"]');
            $option.trigger('click');
        },

        getValue: function() {
            return this.$el.find('.js-value').data('value');
        }
    }, events);

    // Initialize the type dropdown
    var typeDropdown = new DropdownSelector({
        el: '.js-type-dropdown'
    });

    // Toggle the disciplines dialog when the button is clicked
    $('.js-btn-disciplines').on('click', function() {
        $('paper-dialog')[0].toggle();
    });

    // Fetch the configuration file
    $.ajax({
        'url': '/tests/static/widgets/data/config.json'
    }).then(function(config) {
        // Set up the discipline columns
        var cols = [];
        var currentCol = [];
        var colsNr = 4;
        var modulo = Math.ceil(config.disciplines.length / colsNr);
        _.each(config.disciplines, function(discipline, i, disciplines) {
            currentCol.push({
                'label': discipline,
                'value': encodeURIComponent(discipline.toLowerCase().replace(/\s/g, '_'))
            });
            if ((i + 1) % modulo === 0 || (i + 1) === disciplines.length) {
                cols.push(currentCol);
                currentCol = [];
            }
        });
         $('.tpl-disciplines')[0].columns = cols;
    });

    // Progress bar setup
    NProgress.configure({
        parent: '.js-content',
        trickleSpeed: 100
    });
    $(document).on('ajaxStart', NProgress.start).on('ajaxStop', NProgress.done);

    $('.js-btn-back').on('click', function() {
        window.location.href = '/tests';
    });

    // Setup form submit
    $('form').on('submit', function(e) {
        var queryString = $(this).serialize();
        var typeValue = typeDropdown.getValue();

        if (typeValue) {
            queryString += '&s.fvf=' + typeValue;
        }

        if ($('.js-checkbox-fulltext').is('[checked]')) {
            queryString += '&s.fvf=IsFullText,true';
        }

        queryString += _.map($('.js-disciplines [checked]'), function(el) {
            var $el = $(el);
            return '&s.fvf=' + $el.data('value');
        }).join('');

        $.ajax({
            'url': 'widgets/getResults?' + queryString,
            'method': 'GET'
        }).then(function(results) {
            $('.js-results').html(prettyPrint(results.results, {
                maxDepth: 50
            }));
        });

        e.preventDefault();
    });
});
