var bunyan = require('bunyan');

var config = require('../../config');

var logger = null;

/**
 * Function that initializes the Bunyan logging
 */
var initialize = module.exports.initialize = function() {

    // Create a new instance of
    logger = bunyan.createLogger(config.constants.logging);
};

/**
 * Function that logs a message using Bunyan
 *
 * @param  {String}  message    The message that needs to be logged
 */
var log = module.exports.log = function(message) {
    logger.info(message);
};
