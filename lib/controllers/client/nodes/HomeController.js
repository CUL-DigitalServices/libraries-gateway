var util = require('util');

var log = require('../../../util/logger').logger();
var server = require('../../../util/server');
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

        // Check if hostname is set in application locals
        server.setHostName(req);

        // Get the Libraries' Tweets
        twitter.getTweets(function(err, tweets) {
            if (err) {
                log().error(err);
                res.render('errors/500', params, function(err, html) {
                    return indexController.getContent(req, res, 'error-500', html);
                });
            }

            // Create a data object
            var data = {};
            data.tweets = tweets;

            // Render the template
            return that.renderTemplate(req, res, data, 'nodes/home', 'home');
        });
    };
};

// Inherit from the BaseViewController
return util.inherits(HomeController, BaseViewController);
