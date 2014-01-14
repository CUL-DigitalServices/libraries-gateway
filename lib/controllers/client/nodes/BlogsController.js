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

    // Initialize some variables
    var _entries = null;
    var _lastUpdated = null;

    /**
     * Function that renders the blog template
     *
     * @param  {Request}   req    Request object
     * @param  {Response}  res    Response object
     */
    that.getContent = function(req, res) {

        // Check if hostname is set in application locals
        server.setHostName(req);

        // Fetch the blog posts if the previous are expired
        if (_entriesExpired()) {

            // Fetch the blog posts
            _getBlogPosts(function(error, entries) {
                if (error) {
                    log().error(error);
                    return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
                }

                _entries = entries;
                _lastUpdated = Date.now();

                return that.getContent(req, res);
            });

        // If the entries are not expired
        } else {

            // Create a new variable for the entries
            var blogPosts = _entries;

            // Initialize some variables
            var itemsPerPage = config.nodes.blogs.settings.itemsPerPage;
            var start = 0;
            var end = itemsPerPage;

            // Pagination
            if (req.query.page) {

                // Store the number of pages
                var numPages = Math.round(_entries.length / itemsPerPage);

                // Determine whether a valid page is set or not
                var isValid = false;
                var page = Math.round(req.query.page);
                if (_.isNumber(page)) {
                    if (page <= numPages && page > 0) {
                        isValid = true;
                    }
                }

                // Return an error if an invalid page has been specified
                if (!isValid) {
                    log().error('Invalid page specified');
                    return that.renderTemplate(req, res, null, 'errors/404', 'error-404');
                }

                // Determine the range of the entries that need to be displayed
                start = (page * itemsPerPage) - itemsPerPage;
                end = start + itemsPerPage;
            }

            // Get the corresponding entries, based on the specified page
            if (_entries.length) {
                blogPosts = _entries.slice(start, end);
            }

            // Create a data object
            var data = {
                'entries': blogPosts
            };

            // Render the body for the libraries
            return that.renderTemplate(req, res, data, 'nodes/blogs', 'blogs');
        }
    };

    /**
     * Function that determines whether the cached entries have been expired
     *
     * @return {Boolean}  Returns whether the caching of the blog entries has expired or not
     * @api private
     */
    var _entriesExpired = function() {
        var now = Date.now();
        var lifeTime = config.nodes.blogs.settings.expiration;
        return (!_lastUpdated || (now - _lastUpdated) > lifeTime);
    };

    /**
     * Function that fetches the blog posts from the external feed
     *
     * @param  {Function}   callback            Standard callback function
     * @param  {Error}      callback.error      The thrown error
     * @param  {Entry[]}    callback.entries    The returned collection of entries
     * @api private
     */
    var _getBlogPosts = function(callback) {

        // Create a request options object
        var requestOptions = {
            'url': config.nodes['blogs'].settings.url
        }

        // Do a request to the blogs feed
        request(requestOptions, function(error, response, body) {
            if (error) {
                return callback(error);
            }

            // Create an options object for the JSON parsing
            var parseOptions = {
                'trim': true,
                'mergeAttrs': true
            };

            try {

                // Parse the response body
                xml2js.parseString(body, parseOptions, function(error, response) {
                    if (error) {
                        return callback(error);
                    }

                    // Loop all the blog entries from the response
                    var blogPosts = [];
                    _.each(response.feed.entry, function(entry) {

                        // Set the blog properties
                        var id = entry.id;
                        var title = entry.title;
                        var updated = entry.updated;
                        var link = entry.link;
                        var summary = entry.summary;

                        // Create a new model for each blog post before adding to collection
                        var blogPost = new BlogPostModel(id, title, updated, link, summary);
                        blogPosts.push(blogPost);
                    });

                    // Return the blog posts
                    return callback(null, blogPosts);
                });

            } catch(error) {
                return callback(error);
            }
        });
    };
};

// Inherit from the BaseViewController
return util.inherits(BlogsController, BaseViewController);
