var _ = require('underscore');
var bunyan = require('bunyan');

var config = require('../../config');

// The logger to use when no logger is specified
var SYSTEM_LOGGER_NAME = 'system';

// Logger state variables to record active loggers and current configuration
var config = null;
var loggers = {};

/**
 * Create / retrieve a logger with the provided name.
 *
 * @param  {String}     name   The name of the logger
 * @return {Function}          A function that can be used to retrieve the logger
 */
var logger = module.exports.logger = function(name) {
    name = name || SYSTEM_LOGGER_NAME;

    // Lazy-load the logger and cache it so new loggers don't have to be recreated all the time
    if (!loggers[name]) {
        loggers[name] = _createLogger(name);
    }

    // Return a function that returns the logger.
    return function() {
        return loggers[name];
    };
};

/**
 * Create a logger with the provided name.
 *
 * @param  {String}     name    The name to assign to the created logger
 * @api private
 */
var _createLogger = function(name) {
    var _config = _.extend({}, config);
    _config.name = name;
    return bunyan.createLogger(_config);
};
