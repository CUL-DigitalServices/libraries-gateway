var config = require('../../../../config');

var twitter = require('../../../util/twitter');
var util = require('../../../util/util');

var indexController = require('../index');
var navigationController = require('../partials/navigation');

/**
 * Function that renders the index template
 *
 * @param  {Request}   req    Request object
 * @param  {Response}  res    Response object
 */
var getContent = exports.getContent = function(req, res) {

    // Render the navigation template
    navigationController.getContent(req, res, function(err, navigation) {
        if (!err) {

            // Initialize some parameters to pass to the template body
            var params = {
                'currentNode': util.getCurrentNode(req),
                'data': {},
                'partials': {
                    'navigation': navigation
                },
                'title': config.app.title
            };

            // Get the Libraries' Tweets
            twitter.getTweets(function(err, tweets) {
                if (err) {
                    res.render('errors/500', params, function(err, html) {
                        return indexController.getContent(req, res, 'error-500', html);
                    });
                }

                // Add the tweets to the template parameters
                params.data.tweets = tweets;

                // Render the body for the resources and pass the navigation to the template
                res.render('nodes/home', params, function(err, html) {
                    return indexController.getContent(req, res, 'home', html);
                });
            });
        }
    });
};
