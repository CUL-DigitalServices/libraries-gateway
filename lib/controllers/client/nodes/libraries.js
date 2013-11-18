var config = require('../../../../config');
var util = require('../../../util/util');

var indexController = require('../index');
var navigationController = require('../partials/navigation');

/**
 * Function that renders the libraries template
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

            // Render the body for the libraries
            res.render('nodes/find-a-library', params, function(err, html) {
                return indexController.getContent(req, res, html);
            });
        }
    });
};

/**
 * Function that renders the libraries detail template
 *
 * @param  {Request}   req    Request object
 * @param  {Response}  res    Response object
 */
var getLibraryDetail = exports.getLibraryDetail = function(req, res) {

    // Render the navigation template
    navigationController.getContent(req, res, function(err, navigation) {
        if (!err) {

            // Initialize some parameters to pass to the template body
            var params = {
                'currentNode': util.getCurrentNode(req),
                'navigation': navigation,
                'title': config.app.title
            };

            // Render the body for the libraries
            res.render('nodes/find-a-library', params, function(err, html) {
                return indexController.getContent(req, res, html);
            });
        }
    });
};
