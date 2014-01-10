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
     * @param  {Object }   data          The data that needs to be displayed on the template partial
     * @param  {String}    template      The template that needs to be rendered into the index template
     * @param  {String}    templateID    The template identifier
     */
    that.renderTemplate = function(req, res, data, template, templateID) {

        // Render the navigation template
        navigationController.getContent(req, res, function(err, navigation) {
            if (err) {
                log().error(err);
                return res.send(500);
            }

            // Initialize some parameters to pass to the template body
            var parameters = {
                'currentNode': libutil.getCurrentNode(req),
                'data': data,
                'partials': {
                    'navigation': navigation
                },
                'title': config.app.title
            };

            // Render the partial template
            res.render(template, parameters, function(err, body) {
                if (err) {
                    log().error(err);
                    that.renderTemplate(req, res, parameters, 'errors/500', 'error-500');
                }

                // Initialize some parameters to pass to the template body
                var params = {
                    'body': body,
                    'id': templateID,
                    'title': config.app.title
                };

                // Render the index template
                return res.render('index', params);
            });
        });
    };
};
