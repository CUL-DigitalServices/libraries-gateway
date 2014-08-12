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

    // Cache the socket
    var socket = null;

    /**
     * Fetch the results
     *
     * @api private
     */
    var getResults = function() {

        // Disable the button
        $('#btnGetResults').addClass('disabled');

        // Show the progress bar
        $('#lg-search-progress').show();

        $('#lg-score').hide();

        // Request the API results
        socket.emit('getResults');
    };

    /**
     * Function that calculates the scores for the API's
     */
    var calculateAPIScores = function(results) {

        // Collect all the used APIs
        var apis = {};
        _.each(results, function(test) {

            // Object that stores the scores for each API
            var scores = {};

            // Loop all the API-combined tests
            _.each(test.results, function(result, api) {

                // Check whether the API has already been added or not
                if (!apis[api]) {
                    apis[api] = {
                        'fastest': 0,
                        'total': 0
                    }
                }

                // Pluck the query time from all the API results
                if (result.queryTime) {
                    apis[api]['total'] += result.queryTime;
                    scores[api] = result.queryTime;
                }
            });

            // Increase the score of the API with the lowest query time
            if (_.keys(scores).length) {
                var apiToIncrease = _.min(_.keys(scores), function(key) { return scores[key]; });
                apis[apiToIncrease]['fastest']++;
            }
        });

        // Calculate more stuff
        if (results.length) {
            _.each(apis, function(api) {
                api['fastest'] = String(Math.round((api['fastest'] / results.length) * 100)) + '%';
                if (api['total']) {
                    api['average'] = String(Math.ceil(api['total'] / results.length)) + 'ms';
                    api['total'] = String(api['total']) + 'ms';
                }
            });
        }

        // Empty the container
        $('#lg-score').html('');

        // Construct the first row
        var row = '<div class="row row-title">';
        row += '<div class="col col-md-4"> </div>';
        _.each(_.keys(apis), function(api) {
            row += '<div class="col col-title col-md-4">' + api +'</div>';
        });
        row += '</div>';
        $('#lg-score').append(row);

        // Fetch the rownames
        var rownames = [];
        _.each(apis, function(val, api) {
            rownames.push(_.keys(val));
        });
        rownames = _.chain(_.flatten(rownames)).uniq().value();

        // Construct the data rows
        _.each(rownames, function(val) {
            row = '<div class="row row-data">';
            row += '<div class="col col-title col-md-4">' + val + '</div>';
            _.each(apis, function(api) {
                row += '<div class="col col-md-4">' + api[val] + '</div>';
            });
            row += '</div>';
            $('#lg-score').append(row);
        });

        // Add an extra row for the relevant items score
        row = '<div class="row row-data">';
        row += '<div class="col col-title col-md-4">rel</div>';
        _.each(apis, function(val, api) {
            row += '<div class="col col-md-4 col-rel-' + api + '">0</div>';
        });
        row +='</div>';
        $('#lg-score').append(row);

        // Show the container
        $('#lg-score').show();
    };

    /**
     * Function that increases the relativity score of an API
     *
     * @param  {Event}      event       The click event
     * @api private
     */
    var increaseAPIScore = function(event) {

        // Determine which API should be increased
        var api = $(event.currentTarget).attr('data-api');

        // Remove the button
        var testIndex = $(event.currentTarget).attr('data-test-index');
        $('.btnIncreaseRelativityScore[data-test-index=' + testIndex +']').css('visibility', 'hidden');

        // Find the element to update
        var apiEl = $('#lg-score').find('.col-rel-' + api);

        // Calculate the new score
        var newScore = Number($(apiEl).html()) +1;

        // Set the new score in the element
        $(apiEl).html(newScore);
    };

    /**
     * Function that renders the a specified template
     *
     * @param  {String}     target      The element where the target needs to be rendered in
     * @param  {String}     template    The template that needs to be rendered
     * @param  {Object}     data        Object containing the data that needs to be displayed in the template
     * @api private
     */
    var renderTemplate = function(template, target, data) {

        // Pre-compile the template
        var template = _.template($(template).html());

        // Inject the compiled template into our HTML
        $(target).html(template(data));
    };

    /**
     * Initializes the UI
     */
    var initUI = function() {

        // Reset the progress bar
        resetProgressBar();

        // Set some top-level variables for the templates
        _.templateSettings.variable = "lg";
    };

    /**
     * Initializes the web sockets
     */
    var initSockets = function() {

        // Connect with the server
        socket = io.connect('http://localhost:5001');

        // When the socket server returns an error event
        socket.on('onError', function(err) {

            // Disable the button
            $('#btnGetResults').removeClass('disabled');

            // Reset the progress bar
            resetProgressBar();
        });

        // When the socket server returns a progress event
        socket.on('onProgress', function(progress) {
            progress = JSON.parse(progress);

            // Animate the progress bar
            $('#lg-search-progress').animate({
                'width': String(Math.floor(progress.total * 100) + '%')
            });
        });

        // When the socket server returns a results event
        socket.on('getResults', function(results) {

            // Animate the progress bar before displaying the results
            $('#lg-search-progress').animate({'width': '100%'}, 200, 'linear', function() {

                // Parse the results
                results = JSON.parse(results);

                // Calculate which API has the lowest elapsed time
                calculateAPIScores(results);

                // Render the results template
                renderTemplate('.tplResults', '#lg-results', {'results': results});

                // Increase the relativity score of an API
                $('.btnIncreaseRelativityScore').on('click', increaseAPIScore);

                // Disable the button
                $('#btnGetResults').removeClass('disabled');

                // Reset the progress bar
                resetProgressBar();
            });
        });
    };

    /**
     * Reset the progress bar
     */
    var resetProgressBar = function() {
        $('#lg-search-progress').hide().css('width', 0);
    };

    /**
     * Initialize the event listeners
     *
     * @api private
     */
    var addBinding = function() {

        // Get the API results when the button is clicked
        $('#btnGetResults').on('click', getResults);
    };

    /**
     * Initialize the application
     */
    var init = function() {

        // Initialize the UI
        initUI();

        // Initialize the websockets
        initSockets();

        // Initialize event listeners
        addBinding();
    };

    init();
});
