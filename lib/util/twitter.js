var request = require('request');

var config = require('../../config');

/**
 * Function that fetches the tweets from the libraries
 *
 * @param  {Function}  callback           Standard callback function
 * @param  {Error}     callback.err       The thrown error
 * @param  {Tweet[]}   callback.tweets    Collection of tweets
 */
var getTweets = module.exports.getTweets = function(callback) {

    console.log('[twitter] getTweets');

    // Authenticate user
    _authenticate(function(err, res) {
        if (err) {
            return callback(err);
        }
        return callback(null, []);
    });
};

/**
 * Twitter authentication
 *
 * @param  {Function}  callback           Standard callback function
 * @param  {Error}     callback.err       The thrown error
 * @api private
 */
var _authenticate = function(callback) {

    console.log('[twitter] _authenticate');

    // Variables
    var consumer_key = 'tVB8HNLPvrdISIJv1wFcFw';
    var consumer_secret = 'kLWpOxDUZH5fsABjIuHisrTqnlGhSYSVot7jKDuTNA';

    return callback(null, true);
};
