var _ = require('underscore');
var slug = require('slug');

var librariesDAO = require('../../../dao/libraries');

/**
 * Function that returns a collection of all the libraries and their data
 *
 * @param  {Request}   req    Request object
 * @param  {Response}  res    Response object
 */
var getLibraries = exports.getLibraries = function(req, res) {

    // Fetch all the libraries from the database
    librariesDAO.getLibraries(function(err, libraries) {
        if (err) {
            return res.send(500, {'error': err});
        }

        // Check if a library ID has been specified
        if (req.params.id) {
            var library = _.find(libraries, function(lib) {
                return lib.url === req.params.id;
            });
            return res.send(200, library);
        }

        // Return the results
        return res.send(200, libraries);
    });
};
