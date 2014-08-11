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

        // Show the loading modal
        $('#lg-search-progress').show().css('width', '0');

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
                        'time': 0
                    }
                }

                // Pluck the query time from all the API results
                if (result.queryTime) {
                    scores[api] = result.queryTime;
                }
            });

            // Increase the score of the API with the lowest query time
            if (_.keys(scores).length) {
                var apiToIncrease = _.min(_.keys(scores), function(key) { return scores[key]; });
                apis[apiToIncrease]['time']++;
            }
        });

        // Create an template data object
        var templateData = {
            'apis': apis,
            'results': results
        };

        // Render the score template
        renderTemplate('.tplScore', '#lg-score', templateData);

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
        $(event.currentTarget).css('visibility', 'hidden');

        // Find the element to update
        var apiEl = $('#lg-col-score-' + api).find('.score-rel').find('.val');

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

        // Hide the progress bar
        $('#lg-search-progress').hide().css('width', '0');

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

            // Hide the progress bar
            $('#lg-search-progress').hide().css('width', '100%');
        });

        // When the socket server returns a progress event
        socket.on('onProgress', function(progress) {
            $('#lg-search-progress').animate({
                'width': String(Math.floor(progress * 100) + '%')
            });
        }, 200);

        // When the socket server returns a results event
        socket.on('getResults', function(results) {

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

            // Hide the progress bar
            $('#lg-search-progress').hide().css('width', '0');
        });
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
