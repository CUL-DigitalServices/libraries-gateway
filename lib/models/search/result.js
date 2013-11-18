/**
 * A result model
 *
 * @param  {String}  id                  The id of the item
 * @param  {String}  title               The title of the item
 * @param  {String}  author              The author of the item
 * @param  {String}  date                The date of publication
 * @param  {String}  link                The url to the item
 * @param  {String}  contentType         The content type of the item
 * @param  {String}  thumbnail         	 The url to the thumbnail of the item
 * @param  {String}  publicationPlace    The place of publication of the item
 * @param  {String}  branch              The branch where the item is stored
 * @return {Object}                      The returned item object
 */
exports.Result = function(id, title, author, date, link, contentType, thumbnail, publicationPlace, branch) {
    var that = {};
    that.id = id;
    that.title = title;
    that.author = author;
    that.date = date;
    that.link = link;
    that.contentType = contentType;
    that.thumbnail = thumbnail;
    that.publicationPlace = publicationPlace;
    that.branch = branch;
    return that;
};
