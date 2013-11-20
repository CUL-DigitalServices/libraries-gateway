var config = require('../../../config');
var util = require('../../util/util');

var indexController = require('../client/index');
var navigationController = require('../client/partials/navigation');

/**
 * Function that renders the error template
 *
 * @param  {Request}   req     Request object
 * @param  {Response}  res     Response object
 */
var getErrorPage = exports.getErrorPage = function(req, res) {

    // Render the navigation template
    navigationController.getContent(req, res, function(err, navigation) {
        if (!err) {

            // Initialize some parameters to pass to the template body
            var params = {
                'currentNode': util.getCurrentNode(req),
                'partials': {
                    'navigation': navigation
                },
                'title': config.app.title
            };

            // Select the appropriate template
            // var template = res.statusCode || '404';
            var template = '404';

            // Render the 404 template
            res.render('errors/' + template, params, function(err, html) {
                return indexController.getContent(req, res, 'error', html);
            });
        }
    });
};
