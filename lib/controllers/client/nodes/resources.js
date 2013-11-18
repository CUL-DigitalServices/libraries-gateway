var config = require('../../../../config');
var util = require('../../../util/util');

var indexController = require('../index');
var navigationController = require('../partials/navigation');

/**
 * Function that renders the search node template
 *
 * @param  {Request}   req    Request object
 * @param  {Response}  res    Response object
 */
var getContent = exports.getContent = function(req, res) {

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

            // Render the body for the resources
            res.render('nodes/find-a-resource', params, function(err, html) {
                return indexController.getContent(req, res, html);
            });
        }
    });
};

/**
 * Function that renders the resource detail template
 *
 * @param  {Request}   req    Request object
 * @param  {Response}  res    Response object
 */
var getResourceDetail = exports.getResourceDetail = function(req, res) {

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

            console.log('currentNode: ');
            console.log(util.getCurrentNode(req));

            // Render the body for the resources
            res.render('nodes/resource-detail', params, function(err, html) {
                return indexController.getContent(req, res, html);
            });
        }
    });
};
