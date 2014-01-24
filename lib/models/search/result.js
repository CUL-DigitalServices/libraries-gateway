/**
 * A result model
 * Object that contains information about a resource item
 *
 * @param  {String}           id              The resource ID
 * @param  {String}           src             The source of the item (e.g. dspace, m, etc...)
 * @param  {Array}            titles          Collection of titles
 * @param  {String}           description     The resource description
 * @param  {Array}            isbn            Collection of ISBN's
 * @param  {Array}            eisbn           Collection of EISBN's
 * @param  {Array}            issn            Collection of ISSN's
 * @param  {Array}            ssid            Collection of SSID's
 * @param  {Author[]}         authors         Collection of authors
 * @param  {PublicationData}  published       Object containing information about the resource publication
 * @param  {Array}            subjects        Collection of subject (e.g. 'polar motion', 'Darwin'...)
 * @param  {Array}            series          Collection of series
 * @param  {Array}            tags            Collection of tags
 * @param  {Array}            notes           Collection of notes
 * @param  {Array}            contentType     Collection of content types
 * @param  {Array}            thumbnails      Collection of thumbnails
 * @param  {Array}            links           Collection of external links
 * @param  {Branches}         availability    Object that contains information about the availability
 * @return {Object}                           The created result object
 */
exports.Result = function(id, src, extId, titles, description, isbn, eisbn, issn, ssid, authors, published, subjects, series, tags, notes, contentType, thumbnails, links, availability) {
    var that = {};
    that.id = id;
    that.src = src;
    that.extId = extId;
    that.titles = titles;
    that.description = description;
    that.isbn = isbn;
    that.eisbn = eisbn;
    that.issn = issn;
    that.ssid = ssid;
    that.authors = authors;
    that.published = published;
    that.subjects = subjects;
    that.series = series;
    that.tags = tags;
    that.notes = notes;
    that.contentType = contentType;
    that.thumbnails = thumbnails;
    that.links = links;
    that.availability = availability;
    return that;
};

/**
 * An author model
 * Object that contains information about the author
 *
 * @param  {String}  fullname    The name of the author (e.g. `Charles Darwin`)
 * @return {Author}              The created author object
 */
exports.Author = function(fullname) {
    var that = {};
    that.fullname = fullname;
    return that;
};

/**
 * A branch model
 * Object that contains information about a holding branch
 *
 * @param  {String}  name             The library name (e.g.`Caius: Upper Library`)
 * @param  {String}  classmark        The item classmark (e.g. `576.82 DAR/Bow`)
 * @param  {String}  status           The current status (e.g. `available`)
 * @param  {String}  numberOfItems    The number of items the library holds (e.g. `1`)
 */
exports.Branch = function(name, classmark, status, numberOfItems) {
    var that = {};
    that.name = name;
    that.classmark = classmark;
    that.status = status;
    that.numberOfItems = numberOfItems;
    return that;
};

/**
 * A branches model
 * Object that contains all the holding branches and additional information
 *
 * @param  {Number}    totalBranches    Number of holding branches
 * @param  {Branch[]}  branches         Collection of branches
 */
exports.Branches = function(totalBranches, branches) {
    var that = {};
    that.totalBranches = totalBranches;
    that.branches = branches;
    return that;
};

/**
 * A publication model
 * Object that contains information about the publication
 *
 * @param  {Array}            publicationTitle    The resource's publication title (e.g. BMC Bioinformatics)
 * @param  {PublicationDate}  publicationDate     The resource's publication date
 * @param  {Array}            volume              The resource's volume (e.g. 10p.)
 * @param  {Array}            issue               The resource's issue (e.g. 1)
 * @param  {PublicationPage}  publicationPage     The resource's publication page
 * @return {PublicationData}                      The created publicationData object
 */
exports.PublicationData = function(publicationTitle, publicationDate, volume, issue, publicationPage) {
    var that = {};
    that.publicationTitle = publicationTitle;
    that.publicationDate = publicationDate;
    that.volume = volume;
    that.issue = issue;
    that.publicationPage = publicationPage;
    return that;
};

/**
 * A publication date model
 * Object that contains information about the publication date
 *
 * @param  {String}           day        The day of publication (e.g. 01)
 * @param  {String}           month      The month of publication (e.g. 10)
 * @param  {String}           year       The year of publication (e.g. 2010)
 * @param  {String}           label      The generated label (e.g. 01/10/2010)
 * @return {PublicationDate}             The created publicationDate object
 */
exports.PublicationDate = function(day, month, year, label) {
    var that = {};
    that.day = day;
    that.month = month;
    that.year = year;
    that.label = label;
    return that;
};

/**
 * A publication page model
 * Object that contains information about the publication page
 *
 * @param  {String}           startPage    The start page (e.g. S2)
 * @param  {String}           endPage      The end page (e.g. S3)
 * @param  {String}           label        The generated label (e.g. S2/S3)
 * @return {PublicationPage}               The created publicationPage object
 */
exports.PublicationPage = function(startPage, endPage, label) {
    var that = {};
    that.startPage = startPage;
    that.endPage = endPage;
    that.label = label;
    return that;
};
