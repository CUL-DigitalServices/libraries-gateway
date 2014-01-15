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
            if (error) {
                log().error(error);
                return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
            }

            // Create a data object
            var data = {
                'tweets': tweets
            };

            // Render the template
            return that.renderTemplate(req, res, data, 'nodes/home', 'home');
        });
    };
};

// Inherit from the BaseViewController
return util.inherits(HomeController, BaseViewController);
