var util = require('util');

var config = require('../../../../config');

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

        // Render the template
        return that.renderTemplate(req, res, null, 'nodes/my-account', 'my-account');
    };
};

// Inherit from the BaseViewController
return util.inherits(AccountController, BaseViewController);
