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

/**
 * Fetch the results
 */
var getResults = function() {

    // Request the results
    $.ajax({
        'url': '/getResults',
        'method': 'post'
    })

    // Display the results
    .done(function(results) {

        // Set some top-level variables for the template
        _.templateSettings.variable = "lg";

        // Pre-compile the template
        var template = _.template($(document).find('.tplResults').html());

        // The template data
        var templateData = {
            'results': results
        };

        // Inject the compiled template into our HTML
        $(document).find('#lg-results').html(template(templateData));
    })

    // Catch the thrown error, if any
    .fail(function(err) {
        console.log(err);
    });
};

/**
 * Add event listeners to components
 *
 * @api private
 */
var addBinding = function() {

    // Get the API results when the button is clicked
    $(document).find('#btnGetResults').on('click', getResults);
};

$(function () {
    addBinding();
});
