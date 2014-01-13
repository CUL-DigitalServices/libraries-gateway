var config = require('../../../../config');

var log = require('../../../util/logger').logger();
var libutil = require('../../../util/util');

/**
 * Constructor
 */
var NavigationController = module.exports.NavigationController = function() {
    var that = this;

    /**
     * Function that renders the navigation template
     *
     * @param  {Request}   req                  The request object
     * @param  {Response}  res                  The response object
     * @param  {Function}  callback             Standard callback function
     * @param  {Error}     callback.error       The thrown error
     * @param  {String}    callback.template    The HTML dump of the navigation template
     */
    that.getContent = function(req, res, callback) {

        // Create some parameters to pass to the template
        var params = {
            'currentNode': libutil.getCurrentNode(req),
            'nodes': config.nodes
        }

        // Render the navigation body and pass the parameters to the template
        res.render('partials/navigation', params, function(error, template) {
            if (error) {
                log().error(error);
                return callback(error);
            }
            return callback(null, template);
        });
    };
};
