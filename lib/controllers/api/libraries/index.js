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

        // Return the libraries collection
        return res.send(200, libraries);
    });
};

/**
 * Function that returns a library when a slug has been specified
 *
 * @param  {Request}   req    Request object
 * @param  {Response}  res    Response object
 */
var getLibraryBySlug = exports.getLibraryBySlug = function(req, res) {
    if (!req.params.slug) {
        return res.send(400, {'error': 'Invalid or no slug given'});
    }

    // Pick the slug from the request parameters
    var slug = req.params.slug.toLowerCase();

    // Fetch the library from the database
    librariesDAO.getLibraryBySlug(slug, function(err, library) {
        if (err) {
            return res.send(500, {'error': err});            
        }

        // Return a 404 error if the library is not found
        if (!library) {
            return res.send(404, {'error': "Could not find library"});
        }

        // Return the library
        return res.send(200, library);
    });
};
