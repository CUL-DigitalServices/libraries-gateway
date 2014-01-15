var util = require('util');

var BaseViewController = require('../client/BaseViewController').BaseViewController;

/**
 * Constructor
 */
var ErrorHandler = module.exports.ErrorHandler = function() {
    ErrorHandler.super_.apply(this, arguments);
    var that = this;

    /**
     * Function that renders the error template
     *
     * @param  {Request}   req     The request object
     * @param  {Response}  res     The response object
     */
    that.getErrorPage = function(req, res) {

        // Create a template parameters object
        var templateParameters = {
            'pageTitle': 'Error'
        };

        // Render the template
        return that.renderTemplate(req, res, templateParameters, 'errors/404', 'error-404');
    };
};

// Inherit from the BaseViewController
return util.inherits(ErrorHandler, BaseViewController);
