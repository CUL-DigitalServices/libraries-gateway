var util = require('util');

var server = require('../../../util/server');

var BaseViewController = require('../BaseViewController').BaseViewController;

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

        // Render the template
        return that.renderTemplate(req, res, null, 'nodes/blogs', 'blogs');
    };
};

// Inherit from the BaseViewController
return util.inherits(BlogsController, BaseViewController);
