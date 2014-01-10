var config = require('../../../config');

var log = require('../../util/logger').logger();
var server = require('../../util/server');
var util = require('../../util/util');

var IndexController = require('./IndexController');

/**
 * Constructor
 */
var BaseViewController = module.exports.BaseViewController = function() {};

/**
 * Function that fetches the content that needs to be displayed in the controller's view
 */
BaseViewController.prototype.bla = function() {
    console.log("bla");
};

/**
 * Function that renders the viewcontroller's template into the index template
 *
 * @param  {Request}   req           The request object
 * @param  {Response}  res           The response object
 * @param  {Object}    parameters    The template parameters
 * @param  {String}    template      The template that needs to be rendered into the index template
 * @param  {String}    templateID    The template identifier
 */
BaseViewController.prototype.renderTemplate = function(req, res, parameters, template, templateID) {

    // Render the template
    res.render(template, params, function(err, html) {
        if (err) {
            log().error(err);
            res.render('errors/500', params, function(err, html) {
                return IndexController.getContent(req, res, 'error-500', html);
            });
        }

        return IndexController.getContent(req, res, templateID, html);
    });
};
