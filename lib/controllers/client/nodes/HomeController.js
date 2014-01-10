var util = require('util');

var config = require('../../../../config');

var libutil = require('../../../util/util');
var log = require('../../../util/logger').logger();
var server = require('../../../util/server');
var twitter = require('../../../util/twitter');

var BaseViewController = require('../BaseViewController').BaseViewController;
var NavigationController = require('../partials/NavigationController').NavigationController;

/**
 * Constructor
 */
var HomeController = module.exports.HomeController = function() {
    HomeController.super_.apply(this, arguments);
    var that = this;

    // Initialize controllers
    var navigationController = new NavigationController();

    /**
     * Function that renders the index template
     *
     * @param  {Request}   req    Request object
     * @param  {Response}  res    Response object
     */
    that.getContent = function(req, res) {

        // Check if hostname is set in application locals
        server.setHostName(req);

        // Render the navigation template
        navigationController.getContent(req, res, function(err, navigation) {
            if (err) {
                log().error(err);
                return res.send(500);
            }

            // Initialize some parameters to pass to the template body
            var params = {
                'currentNode': libutil.getCurrentNode(req),
                'data': {},
                'partials': {
                    'navigation': navigation
                },
                'title': config.app.title
            };

            // Get the Libraries' Tweets
            twitter.getTweets(function(err, tweets) {
                if (err) {
                    log().error(err);
                    res.render('errors/500', params, function(err, html) {
                        return indexController.getContent(req, res, 'error-500', html);
                    });
                }

                // Add the tweets to the template parameters
                params.data.tweets = tweets;

                // Render the template
                return that.renderTemplate(req, res, params, 'nodes/home', 'home');
            });
        });
    };
};

// Inherit from the BaseViewController
util.inherits(HomeController, BaseViewController);
