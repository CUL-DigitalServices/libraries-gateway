var _ = require('underscore');
var request = require('request');
var util = require('util');
var xml2js = require('xml2js');

var config = require('../../../../config');

var log = require('../../../util/logger').logger();
var server = require('../../../util/server');

var BaseViewController = require('../BaseViewController').BaseViewController;

var BlogPostModel = require('../../../models/blogs/blogs').BlogPost;

/**
 * Constructor
 */
var BlogsController = module.exports.BlogsController = function() {
    BlogsController.super_.apply(this, arguments);
    var that = this;

    /**
     * Function that renders the blog template
     *
     * @param  {Request}   req    Request object
     * @param  {Response}  res    Response object
     */
    that.getContent = function(req, res) {

        // Check if hostname is set in application locals
        server.setHostName(req);

        // Create a data object
        var data = {
            'pageTitle': "Blogs"
        };

        var options = {
            'url': 'http://mix.chimpfeedr.com/0c1cc-gateway-blogs'
        };

        // Do a request to the blogs feed
        request(options, function(error, response, body) {
            if (error) {
                log().error(error);
                return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
            }

            // Create an options object for the JSON parsing
            var parseOpts = {
                'trim': true,
                'mergeAttrs': true
            };

            try {

                // Parse the response body
                xml2js.parseString(body, parseOpts, function(error, response) {
                    if (error) {
                        log().error(error);
                        return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                    }

                    // Loop all the blog entries from the response
                    var blogPosts = [];
                    _.each(response.feed.entry, function(entry) {

                        var id = entry.id;
                        var title = entry.title;
                        var updated = entry.updated;
                        var summary = entry.summary;

                        // Create a new model for each blog post
                        var blogPost = new BlogPostModel(id, title, updated, summary);
                        blogPosts.push(blogPost);
                    });

                    // Create a data object
                    var data = {
                        'entries': blogPosts,
                        'pageTitle': 'Library blogs'
                    };

                    // Render the body for the libraries
                    return that.renderTemplate(req, res, data, 'nodes/blogs', 'blogs');
                });

            } catch(error) {
                log().error(error);
                return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
            }
        });
    };
};

// Inherit from the BaseViewController
return util.inherits(BlogsController, BaseViewController);
