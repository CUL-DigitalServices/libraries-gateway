/**
 * A result model
 *
 * @param  {String}  id                     The id of the item
 * @param  {String}  title                  The title of the item
 * @param  {String}  isbn                   The isbn of the item
 * @param  {String}  eisbn                  The eisbn of the item
 * @param  {String}  issn                   The issn of the item
 * @param  {String}  ssid                   The ssid of the item
 * @param  {String}  author                 The author of the item
 * @param  {String}  date                   The date of publication
 * @param  {String}  physicalDescription    The date of publication
 * @param  {String}  contentType            The content type of the item
 * @param  {String}  thumbnail              The url to the thumbnail of the item
 * @param  {String}  link                   The external link of the item
 * @param  {Object}  branches               The branches where the item is stored
 * @return {Object}                         The returned item object
 */
exports.Result = function(id, extId, title, isbn, eisbn, issn, ssid, author, date, physicalDescription, contentType, thumbnail, link, branches) {
    var that = {};
    that.id = id;
    that.extId = extId;
    that.title = title;
    that.isbn = isbn;
    that.eisbn = eisbn;
    that.issn = issn;
    that.ssid = ssid;
    that.author = author;
    that.date = date;
    that.physicalDescription = physicalDescription;
    that.contentType = contentType;
    that.thumbnail = thumbnail;
    that.link = link;
    that.branches = branches;
    return that;
};
