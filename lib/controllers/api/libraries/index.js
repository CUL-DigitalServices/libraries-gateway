var log = require('../../../util/logger').logger();

var librariesDAO = require('../../../dao/libraries');

/**
 * @swagger
 * resourcePath: /libraries
 * description: Library endpoints
 */

/**
 * @swagger
 * models:
 *   Library:
 *     id: Library
 *     properties:
 *       name:
 *         type: String
 *       code:
 *         type: String
 *       postal_address:
 *         type: String
 *       postcode:
 *         type: String
 *       web_address:
 *         type: String
 *       lat:
 *         type: String
 *       long:
 *         type: String
 *       type:
 *         type: String
 *       opening_hours:
 *         type: String
 *       images:
 *         type: Array
 */

/**
 * @swagger
 * path: /libraries
 * operations:
 *   -  httpMethod: GET
 *      summary: Get all the libraries
 *      responseClass: Library
 *      nickname: getAllLibraries
 */
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
            log().error(err);
            return res.send(500, {'error': err});
        }

        // Return the libraries collection
        return res.send(200, libraries);
    });
};

/**
 * @swagger
 * path: /libraries/{slug}
 * operations:
 *   -  httpMethod: GET
 *      summary: Get a library by its slug identifier
 *      responseClass: Library
 *      nickname: getLibraryBySlug
 *      parameters:
 *        - name: slug
 *          description: The slug identifier for the library you wish to retrieve
 *          paramType: path
 *          required: true
 *          dataType: string
 *      responseMessages:
 *        - code: 400
 *          message: Invalid slug supplied
 *        - code: 404
 *          message: No library for that slug was found
 */
/**
 * Function that returns a library when a slug has been specified
 *
 * @param  {Request}   req    Request object
 * @param  {Response}  res    Response object
 */
var getLibraryBySlug = exports.getLibraryBySlug = function(req, res) {
    if (!req.params.slug) {
        log().error('Invalid or no slug given');
        return res.send(400, {'error': 'Invalid or no slug given'});
    }

    // Pick the slug from the request parameters
    var slug = req.params.slug.toLowerCase();

    // Fetch the library from the database
    librariesDAO.getLibraryBySlug(slug, function(err, library) {
        if (err) {
            log().error(err);
            return res.send(500, {'error': err});
        }

        // Return a 404 error if the library is not found
        if (!library) {
            log().error('Could not find library');
            return res.send(404, {'error': 'Could not find library'});
        }

        // Return the library
        return res.send(200, library);
    });
};
