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

var util = require('util');

var log = require('../../../util/logger').logger();
var twitter = require('../../../util/twitter');

var BaseViewController = require('../BaseViewController').BaseViewController;

/**
 * Constructor
 */
var HomeController = module.exports.HomeController = function() {
    HomeController.super_.apply(this, arguments);
    var that = this;

    /**
     * Function that renders the index template
     *
     * @param  {Request}   req    Request object
     * @param  {Response}  res    Response object
     */
    that.getContent = function(req, res) {

        // Get the Libraries' Tweets
        twitter.getTweets(function(error, tweets) {

            // Create a data object
            var data = {};

            // Display the error message if an error occurred while fetching the Tweets
            if (error) {
                log().error(error);
                data.error = error;
            }

            // Add the tweets to the data object
            data.tweets = tweets

            // Render the template
            return that.renderTemplate(req, res, data, 'nodes/home', 'home');
        });
    };
};

// Inherit from the BaseViewController
return util.inherits(HomeController, BaseViewController);
