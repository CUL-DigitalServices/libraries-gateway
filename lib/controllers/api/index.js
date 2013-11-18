/**
 * Function that returns all the available endpoints for the REST API 
 */
var getContent = exports.getContent = function(req, res) {

    // Collection of endpoints
    var endpoints = {
        'libraries': {
            'uri': '/api/libraries/[ID]'
        },
        'search': {
            'uri': '/api/search/[QUERY]'
        }
    };

    res.send(200, endpoints);
}
