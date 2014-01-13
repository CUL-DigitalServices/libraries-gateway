/**
 * A blog post model
 *
 * @param  {String}    id         The entry's ID (e.g. tag:blogger.com,1999:blog-7721693964257975655.post-7365827974025738847)
 * @param  {String}    title      The entry's title (e.g. Vacation borrowing @ CSL)
 * @param  {String}    updated    The entry's update timestamp (e.g. 2009-11-16T12:54:30+00:00)
 * @param  {String}    summary    The entry's summary (e.g. The Central Science Library is always keen...)
 * @return {BlogPost}             The returned blog post object
 */
exports.BlogPost = function(id, title, updated, summary) {
    var that = {};
    that.id = id;
    that.title = title;
    that.updated = updated;
    that.summary = summary;
    return that;
};
