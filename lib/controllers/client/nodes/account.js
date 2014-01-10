var config = require('../../../../config');

var log = require('../../../util/logger').logger();
var server = require('../../../util/server');
var util = require('../../../util/util');

var indexController = require('../index');
var navigationController = require('../partials/navigation');

/**
 * Function that renders the account template
 *
 * @param  {Request}   req    Request object
 * @param  {Response}  res    Response object
 */
var getContent = exports.getContent = function(req, res) {

    // Check if hostname is set in application locals
    server.setHostName(req);

    // Render the navigation template
    navigationController.getContent(req, res, function(err, navigation) {
        if (err) {
            log().error(err);
            return res.send(500);
        }

        // Initialize some parameters to pass to the template body
        var params = {
            'currentNode': util.getCurrentNode(req),
            'partials': {
                'navigation': navigation
            },
            'title': config.app.title
        };

        // Render the body for the resources
        res.render('nodes/my-account', params, function(err, html) {
            if (err) {
                log().error(err);
                res.render('errors/500', params, function(err, html) {
                    return indexController.getContent(req, res, 'error-500', html);
                });
            }

            return indexController.getContent(req, res, 'my-account', html);
        });
    });
};