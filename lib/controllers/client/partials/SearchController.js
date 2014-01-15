var config = require('../../../../config');

/**
 * Constructor
 */
var SearchController = module.exports.SearchController = function() {
    var that = this;

    /**
     * Function that renders the search box template
     *
     * @param  {Request}   req                  The request object
     * @param  {Response}  res                  The response object
     * @param  {Object}    parameters           The parameters object
     * @param  {Function}  callback             Standard callback function
     * @param  {Error}     callback.error       The thrown error
     * @param  {String}    callback.template    The HTML dump of the search template
     */
    that.getContent = function(req, res, parameters, callback) {

        // Create a search options object
        var searchOptions = {
            'data': {
                'formats': config.constants.formats,
                'query': parameters.query || null
            }
        };

        // Render the search partial
        res.render('partials/find-a-resource/search', searchOptions, function(error, template) {
            if (error) {
                return callback(error);
            }
            return callback(null, template);
        });
    };
};
