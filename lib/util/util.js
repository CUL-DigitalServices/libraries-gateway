var config = require('../../config');

/**
 * Function that returns the current node
 *
 * @param  {Request}  req    Request object
 * @return {Object}          The current node
 */
var getCurrentNode = module.exports.getCurrentNode = function(req) {
    // Get the main node from the request
    var node = config.nodes['home'];
    if (req.route) {
        // Since we receive the path as a string, we need to split on slashes
        var nodes = req.route.path.split('/');
        nodes.splice(0,1);
        node = config.nodes[nodes[0]] || config.nodes['home'];
    }
    return node;
};

/**
 * Function that returns a parameter out of a querystring
 *
 * @param  {Object}          querystring    Querystring object
 * @param  {String}          key            The key to retrieve from the querystring
 * @return {String|Boolean}
 */
var hasParameter = module.exports.hasParameter = function(querystring, key) {
    if (!querystring[key]) {
        return false;
    }
    return querystring[key];
};
