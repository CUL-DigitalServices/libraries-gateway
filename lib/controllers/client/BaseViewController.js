var config = require('../../../config');

var log = require('../../util/logger').logger();
var libutil = require('../../util/util');

var NavigationController = require('./partials/NavigationController').NavigationController;

/**
 * Constructor
 */
var BaseViewController = module.exports.BaseViewController = function() {
    var that = this;

    // Initialize controllers
    var navigationController = new NavigationController();

    /**
     * Function that renders the viewcontroller's template into the index template
     *
     * @param  {Request}   req           The request object
     * @param  {Response}  res           The response object
     * @param  {Object}    parameters    The template parameters
     * @param  {String}    template      The template that needs to be rendered into the index template
     * @param  {String}    templateID    The template identifier
     */
    that.renderTemplate = function(req, res, parameters, template, templateID) {

        // Render the partial template
        res.render(template, parameters, function(err, html) {
            if (err) {
                log().error(err);
                that.renderTemplate(req, res, parameters, 'errors/500', 'error-500');
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
};
