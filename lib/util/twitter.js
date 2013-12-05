var _ = require('underscore');
var request = require('request');
var querystring = require('querystring');

var config = require('../../config');

var twitterModel = require('../models/twitter/twitter');

var _access_token = null;

/**
 * Function that fetches the tweets from the libraries
 *
 * @param  {Function}  callback                 Standard callback function
 * @param  {Error}     callback.err             The thrown error
 * @param  {Tweet[]}   callback.tweets          Collection of tweets
 */
var getTweets = module.exports.getTweets = function(callback) {

    // Perform authentication if the Twitter access token hasn't been retrieved yet
    if (!getAccessToken()) {

        // Authenticate user before requesting tweets
        _authenticate(function(err) {
            if (err) {
                return callback(err);
            }

            // Recall getTweets after authentication was successful
            return getTweets(callback);
        });

    // If we're already authenticated on the Twitter API
    } else {

        // Request tweets from the Twitter API
        _requestTweets(function(err, tweets) {
            if (err) {
                return callback(err);
            }

            // Return the tweets
            return callback(null, tweets);
        });
    }
};

/**
 * Function that requests a Twitter access token
 *
 * @param  {Function}  callback                 Standard callback function
 * @param  {Error}     callback.err             The thrown error
 * @param  {String}    callback.access_token    The Twitter access token
 * @api private
 */
var _authenticate = function(callback) {

    // Authentication credentials
    var consumer_key = config.secret.twitter.consumer_key;
    var consumer_secret = config.secret.twitter.consumer_secret;

    // Create a credentials hash
    var credentials = _getCredentialsBase64(consumer_key, consumer_secret);

    // Request options
    var options = {
        'method': 'POST',
        'url': 'https://api.twitter.com/oauth2/token',
        'body': querystring.stringify({'grant_type': 'client_credentials'}),
        'headers': {
            'Authorization': 'Basic ' + credentials,
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        }
    };

    // Send a token request to the Twitter API
    request(options, function(error, response, body) {
        if (error) {
            return callback('Error while authenticating on Twitter');
        }

        try {
            var body = JSON.parse(body);
            setAccessToken(body.access_token);
            return callback();
        } catch(e) {
            return callback('Error while authenticating on Twitter');
        }
    });
};

/**
 * Function that encodes the authentication credentials
 *
 * @param  {String}    key                      The Twitter consumer key
 * @param  {String}    secret                   The Twitter consumer secret
 * @return {Buffer}                             The hashed authenticaton credentials
 * @api private
 */
var _getCredentialsBase64 = function(key, secret) {
    return new Buffer(encodeURI(key) + ':' + encodeURI(secret)).toString('base64');
};

/**
 * Function that fetches the tweets form the Twitter API
 *
 * @param  {Function}  callback                 Standard callback function
 * @param  {Error}     callback.err             The thrown error
 * @param  {Tweet[]}   callback.tweets          Collection of tweets
 * @api private
 */
var _requestTweets = function(callback) {

    var bodyParams = {
        'slug': 'cam-uni-libraries',
        'owner_screen_name': 'libatcam',
        'count': 8
    };

    // Request options
    var options = {
        'method': 'GET',
        'url': 'https://api.twitter.com/1.1//lists/statuses.json?' + querystring.stringify(bodyParams),
        'headers': {
            'Authorization': 'Bearer ' + getAccessToken()
        }
    };

    // Send a tweet request to the Twitter API
    request(options, function(error, response, body) {
        if (error) {
            return callback('Error while fetching tweets');
        }

        try {

            // Parse the response body
            var body = JSON.parse(body);
            var tweets = _.map(body, function(tweet) {
                return _createTweetModel(tweet);
            });

            // Return the tweet collection
            return callback(null, tweets);

        } catch(e) {

            // Return an error if the parsing or populating of the collection failed
            return callback('Error while parsing Twitter feed');
        }
    });
};

/**
 * Function that creates a new tweet model per record
 *
 * @param  {Object}    record                   Object containing raw tweet data
 * @return {Tweet}                              The returned tweet model
 * @api private
 */
var _createTweetModel = function(record) {

    // Pick the properties out of the record
    var name = record.user.name;
    var screen_name = record.user.screen_name;
    var created_at = record.created_at;
    var text = record.text;

    // Return a tweet model
    return new twitterModel.Tweet(name, screen_name, created_at, text);
};

/**
 * Getter for the Twitter access token
 *
 * @return {String}                             The Twitter access token
 * @api private
 */
var getAccessToken = function() {
    return this._access_token;
};

/**
 * Setter for the Twitter access token
 *
 * @param  {String}    access_token             The Twitter access token
 * @api private
 */
var setAccessToken = function(access_token) {
    this._access_token = access_token;
};
