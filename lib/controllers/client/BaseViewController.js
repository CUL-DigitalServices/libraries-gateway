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
 * Function that renders the viewcontroller's template into the index template
 *
 * @param  {Request}   req           The request object
 * @param  {Response}  res           The response object
 * @param  {Object}    parameters    The template parameters
 * @param  {String}    template      The template that needs to be rendered into the index template
 * @param  {String}    templateID    The template identifier
 */
BaseViewController.prototype.renderTemplate = function(req, res, parameters, template, templateID) {

    // Render the partial template
    res.render(template, parameters, function(err, html) {
        if (err) {
            log().error(err);
            res.render('errors/500', parameters, function(err, html) {
                return IndexController.getContent(req, res, 'error-500', html);
            });
        }

        // Initialize some parameters to pass to the template body
        var params = {
            'body': html,
            'id': templateID,
            'title': config.app.title
        };

        // Render the index template
        return res.render('index', params);
    });
};
