/**
 * Function that initializes the server by calling the 'createServer' method in the server util.
 * After the server has been created and successfully spun up, the routes are registered.
 * @api private
 */
var init = function() {

    /**
     * Create a new express server
     */
    require('./lib/util/server').createServer();
};

init();
