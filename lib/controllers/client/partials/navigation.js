var config = require('../../../../config');
var util = require('../../../util/util');

/**
 * Function that renders the navigation template
 *
 * @param  {Request}   req              Request object
 * @param  {Response}  res              Response object
 * @param  {Function}  callback         Standard callback function
 * @param  {Error}     callback.err     The thrown error
 * @param  {String}    callback.html    The HTML dump of the navigation template
 */
var getContent = exports.getContent = function(req, res, callback) {

    // Create some parameters to pass to the template
    var params = {
        'currentNode': util.getCurrentNode(req),
        'nodes': config.nodes
    }

    // Render the navigation body and pass the parameters to the template
    res.render('partials/navigation', params, function(err, html) {
        if (!err) {
            return callback(null, html);
        }
        return callback(err);
    });
};
