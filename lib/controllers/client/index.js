var config = require('../../../config');

var log = require('../../util/logger').logger();
var util = require('../../util/util');

var navigationController = require('./partials/navigation');

/**
 * Function that renders the index template
 *
 * @param  {Request}   req     Request object
 * @param  {Response}  res     Response object
 * @param  {String}    id      The unique id of the page
 * @param  {String}    body    The body that needs to be rendered
 */
var getContent = exports.getContent = function(req, res, id, body) {

    // Initialize some parameters to pass to the template body
    var params = {
        'body': body,
        'id': id,
        'title': config.app.title
    };

    // Render the index page and pass the header, body and footer to the index template
    // The body also contains the rendered navigation
    body = body || "<div>Not found</div>";
    return res.render('index', params);
};

/**
 * Function that renders the error template
 *
 * @param  {Request}   req     Request object
 * @param  {Response}  res     Response object
 */
var getErrorPage = exports.getErrorPage = function(req, res) {

    // Render the navigation template
    navigationController.getContent(req, res, function(err, navigation) {
        if (err) {
            log().error(err);
            return res.send(400);
        }

        // Initialize some parameters to pass to the template body
        var params = {
            'partials': {
                'navigation': navigation
            },
            'title': config.app.title
        };

        // Select the appropriate template
        var template = res.statusCode || '404';

        // Render the 404 template
        res.render('errors/' + template, params, function(err, html) {
            log().error(err);
            getContent(req, res, html);
        });
    });
};
