/**
 * A result model
 * Object that contains information about a resource item
 *
 * @param  {String}    id                     The id of the item
 * @param  {String}    src                    The source of the item (e.g. dspace, m, etc...)
 * @param  {Array}     title                  The title of the item
 * @param  {Array}     isbn                   The isbn of the item
 * @param  {Array}     eisbn                  The eisbn of the item
 * @param  {Array}     issn                   The issn of the item
 * @param  {Array}     ssid                   The ssid of the item
 * @param  {Array}     author                 The author of the item
 * @param  {Array}     date                   The date of publication
 * @param  {Array}     subject                The subject of the item (e.g. 'polar motion', 'Darwin'...)
 * @param  {Array}     physicalDescription    The date of publication
 * @param  {Array}     series                 The series of the item
 * @param  {Array}     note                   The note of the item
 * @param  {Array}     contentType            The content type of the item
 * @param  {Array}     thumbnail              The url to the thumbnail of the item
 * @param  {Array}     link                   The external link of the item
 * @param  {Branch[]}  branches               The branches where the item is stored
 * @return {Object}                           The returned item object
 */
exports.Result = function(id, src, extId, title, isbn, eisbn, issn, ssid, author, date, subject, physicalDescription, series, note, contentType, thumbnail, link, branches) {
    var that = {};
    that.id = id;
    that.src = src;
    that.extId = extId;
    that.title = title;
    that.isbn = isbn;
    that.eisbn = eisbn;
    that.issn = issn;
    that.ssid = ssid;
    that.author = author;
    that.date = date;
    that.subject = subject;
    that.physicalDescription = physicalDescription;
    that.series = series;
    that.note = note;
    that.contentType = contentType;
    that.thumbnail = thumbnail;
    that.link = link;
    that.branches = branches;
    return that;
};
