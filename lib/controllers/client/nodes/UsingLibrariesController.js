var util = require('util');

var server = require('../../../util/server');

var BaseViewController = require('../BaseViewController').BaseViewController;

/**
 * Constructor
 */
var UsingLibrariesController = module.exports.UsingLibrariesController = function() {
    UsingLibrariesController.super_.apply(this, arguments);
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

        // Create a data object
        var data = {};

        // Render the template
        return that.renderTemplate(req, res, data, 'nodes/using-our-libraries', 'using-our-libraries');
    };
};

// Inherit from the BaseViewController
return util.inherits(UsingLibrariesController, BaseViewController);
