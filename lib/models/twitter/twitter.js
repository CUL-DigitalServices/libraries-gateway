/**
 * A tweet model
 *
 * @param  {String}  name                   The name of the user (e.g. Earth Sci Library)
 * @param  {String}  screen_name            The screen name of the user (e.g. EarthSciCam)
 * @param  {String}  created_at             The date of the tweet (e.g. Wed Dec 04 14:51:13 +0000 2013)
 * @param  {String}  text                   The tweet message
 * @return {Tweet}                          The returned coords object
 */
exports.Tweet = function(name, screen_name, created_at, text) {
    var that = {};
    that.name = name;
    that.screen_name = screen_name;
    that.created_at = created_at;
    that.text = text;
    return that;
};
