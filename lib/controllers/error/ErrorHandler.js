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

        // Since Express doesn't return a statusCode, we first check if the route is set to determine whether we should display a 404 error page or not
        if (!req.route) {
            return that.renderTemplate(req, res, null, 'errors/404', 'error-404');
        }

        // In any other case we display a 500 error page
        return that.renderTemplate(req, res, null, 'errors/500', 'error-500');
    };
};

// Inherit from the BaseViewController
return util.inherits(ErrorHandler, BaseViewController);
