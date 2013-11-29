var config = require('../../../../config');
var util = require('../../../util/util');

/**
 * Function that renders the search box template
 *
 * @param  {Request}   req    Request object
 * @param  {Response}  res    Response object
 */
var getContent = exports.getContent = function(req, res, callback) {

    // Create some parameters to pass to the template
    var params = {
        'data': {
            'formats': config.constants.formats
        }
    }

    // Render the search box body and pass the parameters to the template
    res.render('partials/search', params, function(err, html) {
        if (!err) {
            return callback(null, html);
        }
        return callback(err);
    });
};
