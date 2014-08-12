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

    /**
     * Function that submits the form data to the REST API endpoint
     */
    var onFormSubmit = function(event) {

        // Construct the querystring that will be used to request Summon data
        var queryString = $(event.currentTarget).serialize();

        // Perform an AJAX call
        $.ajax({
            'url': 'widgets/getResults?' + queryString,
            'method': 'GET'
        })

            // AJAX success handler
            .done(function(results) {
                console.log(results);
            })

            // AJAX error handler
            .fail(function(err) {
                console.log(err);
            });

        return false;
    };

    /**
     * Initialize the event listeners
     *
     * @api private
     */
    var addBinding = function() {

        // Submit the form data
        $('form').on('submit', onFormSubmit);
    };

    /**
     * Initialize the application
     */
    var init = function() {

        // Initialize event listeners
        addBinding();
    };

    init();
});
