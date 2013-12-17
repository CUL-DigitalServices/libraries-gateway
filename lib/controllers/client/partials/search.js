var config = require('../../../../config');

var log = require('../../../util/logger').logger();
var util = require('../../../util/util');

/**
 * Function that renders the search box template
 *
 * @param  {Request}   req              Request object
 * @param  {Response}  res              Response object
 * @param  {Object}    params           Parameters for the template
 * @param  {Function}  callback         Standard callback function
 * @param  {Error}     callback.err     The thrown error
 * @param  {String}    callback.html    The HTML dump of the search template
 */
var getContent = exports.getContent = function(req, res, params, callback) {

    // Create some parameters to pass to the template
    var params = {
        'data': {
            'formats': config.constants.formats,
            'query': params.query || null
        }
    };

    // Render the search box body and pass the parameters to the template
    res.render('partials/search', params, function(err, html) {
        if (err) {
            log().error(err);
            return callback(err);
        }
        return callback(null, html);
    });
};
