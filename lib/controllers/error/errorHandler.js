var config = require('../../../config');

var log = require('../../util/logger').logger();
var libutil = require('../../util/util');

var indexController = require('../client/IndexController');
var NavigationController = require('../client/partials/NavigationController').NavigationController;

var ErrorHandler = module.exports.ErrorHandler = function() {
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

            // Select the appropriate template
            var template = '404';

            // Render the 404 template
            res.render('errors/' + template, params, function(err, html) {
                if (err) {
                    log().error(err);
                    return res.send(500);
                }

                return indexController.getContent(req, res, 'error', html);
            });
        });
    };
};
