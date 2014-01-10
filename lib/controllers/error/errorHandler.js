var util = require('util');

var config = require('../../../config');

var libutil = require('../../util/util');
var log = require('../../util/logger').logger();

var BaseViewController = require('../client/BaseViewController').BaseViewController;
var NavigationController = require('../client/partials/NavigationController').NavigationController;

var ErrorHandler = module.exports.ErrorHandler = function() {
    ErrorHandler.super_.apply(this, arguments);
    var that = this;

    // Initialize controllers
    var navigationController = new NavigationController();

    /**
     * Function that renders the error template
     *
     * @param  {Request}   req     Request object
     * @param  {Response}  res     Response object
     */
    that.getErrorPage = function(req, res) {

        // Render the navigation template
        navigationController.getContent(req, res, function(err, navigation) {
            if (err) {
                log().error(err);
                return res.send(500);
            }

            // Initialize some parameters to pass to the template body
            var params = {
                'currentNode': libutil.getCurrentNode(req),
                'partials': {
                    'navigation': navigation
                },
                'title': config.app.title
            };

            // Render the template
            return that.renderTemplate(req, res, params, 'errors/404', 'error-404');
        });
    };
};

// Inherit from the BaseViewController
util.inherits(ErrorHandler, BaseViewController);
