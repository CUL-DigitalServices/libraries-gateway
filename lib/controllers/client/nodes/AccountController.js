var util = require('util');

var server = require('../../../util/server');

var BaseViewController = require('../BaseViewController').BaseViewController;

/**
 * Constructor
 */
var AccountController = module.exports.AccountController = function() {
    AccountController.super_.apply(this, arguments);
    var that = this;

    /**
     * Function that renders the account template
     *
     * @param  {Request}   req    Request object
     * @param  {Response}  res    Response object
     */
    that.getContent = function(req, res) {

        // Check if hostname is set in application locals
        server.setHostName(req);

        // Create a data object
        var data = {
            'pageTitle': "My account"
        };

        // Render the template
        return that.renderTemplate(req, res, data, 'nodes/my-account', 'my-account');
    };
};

// Inherit from the BaseViewController
return util.inherits(AccountController, BaseViewController);
