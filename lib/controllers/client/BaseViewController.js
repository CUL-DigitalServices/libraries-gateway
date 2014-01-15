var config = require('../../../config');

var log = require('../../util/logger').logger();
var libutil = require('../../util/util');
var server = require('../../util/server');

var NavigationController = require('./partials/NavigationController').NavigationController;

/**
 * Constructor
 */
var BaseViewController = module.exports.BaseViewController = function() {
    var that = this;

    // Initialize controllers
    var navigationController = new NavigationController();

    // Create variables for the static templates
    var _tplFooter = null;
    var _tplHeader = null;

    /**
     * Function that renders the static templates
     *
     * @param  {Request}   req               The request object
     * @param  {Response}  res               The response object
     * @param  {Function}  callback          Standard callback function
     * @param  {Error}     callback.error    The thrown error
     * @api private
     */
    var _renderStaticTemplates = function(req, res, callback) {

        // Execute the callback function if the templates are already rendered and cached
        if (_tplHeader && _tplFooter) {
            return callback(null);
        }

        // Render the header partial
        res.render('partials/globals/header', function(error, tplHeader) {
            if (error) {
                return callback(error);
            }
            _tplHeader = tplHeader;

            // Render the footer partial
            res.render('partials/globals/footer', function(error, tplFooter) {
                if (error) {
                    return callback(error)
                }
                _tplFooter = tplFooter;

                // Callback
                return callback(null);
            });
        });
    };

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

        // Check if hostname is set in application locals
        server.setHostName(req);

        try {

            // Render the navigation template
            navigationController.getContent(req, res, function(error, tplNavigation) {
                if (error) {
                    log().error(error);
                    return res.send(500, 'Error while rendering navigation template');
                }

                // Create a parameters object for the header template
                var parameters = {
                    'data': {
                        'applicationTitle': config.app.title,
                        'currentNode': libutil.getCurrentNode(req)
                    }
                };

                // Check if the page title is specified
                if (data && data.pageTitle) {
                    parameters.data.pageTitle = data.pageTitle;
                }

                // Render the page header
                res.render('partials/globals/page-header', parameters, function(error, tplPageHeader) {
                    if (error) {
                        log().error(error);
                        return res.send(500, 'Error while rendering page header template');
                    }

                    // Create a parameters object for the partial template
                    var parameters = {
                        'currentNode': libutil.getCurrentNode(req),
                        'data': data,
                        'partials': {
                            'header': tplPageHeader,
                            'navigation': tplNavigation
                        },
                        'title': config.app.title
                    };

                    // Render the partial template
                    res.render(template, parameters, function(error, tplBody) {
                        if (error) {
                            log().error(error);
                            return res.send(500, 'Error while rendering body template');
                        }

                        // First render the static partials in order to continue
                        _renderStaticTemplates(req, res, function(error) {
                            if (error) {
                                log().error(error);
                                return res.send(500, 'Error while rendering static templates');
                            }

                            // Initialize some parameters to pass to the template body
                            var params = {
                                'partials': {
                                    'body': tplBody,
                                    'footer': _tplFooter,
                                    'header': _tplHeader
                                },
                                'settings': {
                                    'id': templateID,
                                    'title': config.app.title
                                }
                            };

                            // Render the index template
                            return res.render('index', params, function(error, tplIndex) {
                                if (error) {
                                    log().error(error);
                                    return res.send(500, 'Error while rendering index template');
                                }
                                return res.send(200, tplIndex);
                            });
                        });
                    });
                });
            });

        } catch(error) {
            log().error(error);
            res.send(500, 'Error while rendering template');
        }
    };
};
