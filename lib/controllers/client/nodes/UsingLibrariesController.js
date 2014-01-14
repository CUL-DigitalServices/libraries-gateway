var util = require('util');

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

        // Render the template
        return that.renderTemplate(req, res, null, 'nodes/using-our-libraries', 'using-our-libraries');
    };
};

// Inherit from the BaseViewController
return util.inherits(UsingLibrariesController, BaseViewController);
