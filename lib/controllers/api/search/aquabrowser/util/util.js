var _ = require('underscore');

var config = require('../../../../../../config');

var libUtil = require('../../../../../util/util');
var log = require('../../../../../util/logger').logger();

var ResultModel = require('../../../../../models/search/result');

var keys = config.constants.alphabet;

/**
 * Function that gets d/field properties of the item record
 *
 * @param  {Object}  record    Object containing item information
 * @param  {String}  root      The object root
 * @param  {Number}  index     The index of the collection
 * @param  {String}  key       The key of the property
 * @return {String}            The returned value
 * @api private
 */
var _getItemData = function(record, root, index, key) {
    try {
        var data = record[root][0][key];
        if(!_.isArray(data)) {
            return [data];
        }
        return data;
    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that picks a specific property from an item record
 *
 * @param  {Object}  record       Object containing record data
 * @param  {Object}  property     The property that holds the data
 * @param  {Object}  separator    The character that separates the items
 * @return {Array}                The returned property
 * @api private
 */
var _getItemProperty = function(record, property, separator) {
    var values = null;
    try {
        var data = _getItemData(record, 'd', 0, property);
        if (data !== null) {
            if (data.length > 1) {
                values = [];
                _.each(data, function(item) {
                    if (item[property]) {
                        _.each(item[property], function(row) {
                            if (keys.indexOf(row.key) > -1 && row._) {
                                values.push(row._);
                            }
                        });
                    }
                });
            } else if (data[0] && data[0][property]) {
                values = [];
                _.each(data[0][property], function(row) {
                    if (keys.indexOf(row.key) > -1 && row._) {
                        values.push(row._);
                    }
                });
                return [values.join(separator)];
            }
        }
        return values;
    } catch(error) {
        log().warn(error);
        return null;
    }
};

/**
 * Function that returns the resource's author(s)
 * MARC21: df100
 *
 * @param  {Object}    record    Object containing record data
 * @return {Author[]}            Array containing the author(s)
 */
var getResourceAuthors = module.exports.getResourceAuthors = function(record) {
    try {
        var authors = null;
        var marc = 'df100';
        if (record.d && record.d[0]){
            authors = authors || [];
            var data = record.d[0];

            // Check if the author property is set
            if (data[marc]) {

                // Loop the authors
                _.each(data[marc], function(row) {
                    var fullname = null;
                    _.each(row, function(item) {
                        if (item.key === 'a' && item._) {
                            fullname = item._;
                        }
                    });
                    var author = new ResultModel.Author(fullname);
                    if (Object.keys(author).length) authors.push(author);
                });
            }
            if (!authors.length) authors = null;

        } else if (record.fields) {
            _.each(record.fields, function(row) {
                if (row.author) {
                    authors = authors || [];
                    var authorModel = new ResultModel.Author(row.author);
                    authors.push(authorModel);
                }
            });
            if (!authors.length) authors = null;
        }
        return authors;
    } catch(error) {
        log().error(error);
        return authors;
    }
};

/**
 * Function that returns the resource's content type
 *
 * @param  {Object}  record    Object containing record data
 * @return {Arry}              Collection of content types
 */
var getResourceContentType = module.exports.getResourceContentType = function(record) {
    try {
        var contentType = null;
        if (record.fields) {
            if (record.fields['material_t']) {
                contentType = record.fields['material_t'];
            } else if (record.fields[0]) {
                contentType = record.fields[0]['material_t'];
            }
        }
        return contentType;
    } catch(error) {
        log().error(error);
        return null;
    }
}

/**
 * Function that returns the resource's external ID
 *
 * @param  {Object}  record    Object containing record data
 * @return {String}            The resource's external ID
 */
var getResourceExtID = module.exports.getResourceExtID = function(record) {
    try {
        var id = null;
        if (record && record.extID) {
            id = record.extID;
        }
        return id;
    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that returns the resource's ID
 *
 * @param  {Object}  record    Object containing record data
 * @return {String}            The resource's ID
 */
var getResourceID = module.exports.getResourceID = function(record) {
    try {
        var id = null;
        if (record.fields) {
            if (record.fields[0]) {
                id = record.fields[0].id;
            } else if (record.fields.id) {
                id = record.fields.id;
            }
        }
        return id;
    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that returns the resource's ISBN's
 *
 * @param  {Object}  record    Object containing record data
 * @return {String}            Collection of resource ISBN's
 */
var getResourceISBN = module.exports.getResourceISBN = function(record) {
    try {
        var isbn = null;
        if (record.d) {
            isbn = _getItemProperty(record, 'df020', ', ');
        }
        return isbn;
    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that returns the resource's link(s)
 *
 * @param  {Object}  record    Object containing record data
 * @return {Array}             Collection of resource links
 */
var getResourceLinks = module.exports.getResourceLinks = function(record) {
    try {
        var links = null;
        if (record.fields) {
            if (record.fields[0] && record.fields[0].identifier) {
                links = libUtil.putInArrayIfNotNull(record.fields[0].identifier);
            } else if (record.fields.identifier) {
                links = libUtil.putInArrayIfNotNull(record.fields.identifier);
            }
        }
        return links;
    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that returns the resource's notes
 *
 * @param  {Object}  record    Object containing record data
 * @return {Array}             Collection of resource notes
 */
var getResourceNotes = module.exports.getResourceNotes = function(record) {
    try {
        var note = null;
        var marc = 'df504';
        if (record.d) {
            note = _getItemProperty(record, marc, ', ');
        }
        return note;
    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that returns the resource's title(s)
 * MARC21: df245
 *
 * @param  {Object}  record    Object containing record data
 * @return {Array}             Collection of resource titles
 */
var getResourceTitles = module.exports.getResourceTitles = function(record) {
    try {
        var titles = null;
        var marc = 'df245';
        if (record.d && record.d[0]){
            titles = titles || [];
            var data = record.d[0];
            _.each(data[marc], function(row) {
                var title = [];
                _.each(row, function(item) {
                    if (item._ && keys.indexOf(item.key) > -1) {
                        title.push(item._);
                    }
                });
                if (title.length) {
                    title = title.join(' ');
                    titles.push(title);
                }
            });

        } else if (record.fields) {
            _.each(record.fields, function(row) {
                titles = titles || [];
                if (row.title) titles.push(row.title);
            });
        }
        return titles;

    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that returns the resource's publication data
 *
 * @param  {Object}           record    Object containing record data
 * @return {PublicationData}            The created PublicationData model
 */
var getResourcePublicationData = module.exports.getResourcePublicationData = function(record) {
    try {

        var day = null;
        var month = null;
        var year = null;

        // Title
        var publicationPublisher = null;
        if (record.d && record.d[0]) {
            var data = record.d[0];
            publicationPublisher = publicationPublisher || [];
            _.each(data['df260'], function(row) {
                var values = [];
                var chars = ['a', 'b'];
                _.each(row, function(item) {
                    if (item._) {
                        if (chars.indexOf(item.key) > -1 && item._) {
                            values.push(item._);
                        } else if (item.key === 'c') {
                            year = item._;
                        }
                    }
                });
                publicationPublisher.push(values.join(' '));
            });

        } else if (record.fields) {
            _.each(record.fields, function(row) {
                if (row.publisheryear) year = row.publisheryear;
                if (row.publisher) {
                    publicationPublisher = publicationPublisher || [];
                    publicationPublisher.push(row.publisher);
                }
           });
        }

        // Date
        var lblDate = _.compact([day, month, year]).join('-');
        var publicationDate = new ResultModel.PublicationDate(day, month, year, lblDate);

        // Volume
        var publicationVolume = null;
        if (record.d && record.d[0]) {
            var data = record.d[0];
            publicationVolume = publicationVolume || [];
            _.each(data['df300'], function(row) {
                var values = [];
                _.each(row, function(item) {
                    if (keys.indexOf(item.key) > -1 && item._) {
                        values.push(item._);
                    }
                });
                publicationVolume.push(values.join(' '));
            });
        }

        // Issue
        var publicationIssue = null;
        var publicationPage = null;

        // Create a new publication data model
        var publicationData = new ResultModel.PublicationData(publicationPublisher, publicationDate, publicationVolume, publicationIssue, publicationPage);
        return publicationData;

    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that returns the resource's series
 * MARC21: df490
 *
 * @param  {Object}  record    Object containing record data
 * @return {Array}             Collection of series
 */
var getResourceSeries = module.exports.getResourceSeries = function(record) {
    try {
        var marc = 'df490';
        var series = null;
        if (record.d && record.d[0]){
            series = series || [];
            var data = record.d[0];
            _.each(data[marc], function(row) {
                var serie = [];
                _.each(row, function(item) {
                    if (keys.indexOf(item.key) > -1 && item._) {
                        serie.push(item._);
                    }
                });
                if (serie.length) {
                    serie = serie.join(' ');
                    series.push(serie);
                }
            });
            if (!series.length) series = null;
        }
        return series;

    } catch(error) {
        log().error(error);
        return series;
    }
};

/**
 * Function that returns the resource's source
 *
 * @param  {Object}  record    Object containing record data
 * @return {String}            The resource's source
 */
var getResourceSource = module.exports.getResourceSource = function(record) {
    try {
        var source = null;
        if (record.src) {
            source = record.src;
        }
        return source;
    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that returns that resource's subject
 *
 * @param  {Object}  record    Object containing record data
 * @return {Array}             Collection of subjects
 */
var getResourceSubjects = module.exports.getResourceSubjects = function(record) {
    try {
        var marc = 'df650';
        var subjects = null;
        if (record.d && record.d[0]) {
            subjects = subjects || [];
            _.each(record.d[0][marc], function(row) {
                var subject = [];
                _.each(row[marc], function(item) {
                    if (keys.indexOf(item.key) > -1 && item._) {
                        subject.push(item._);
                    }
                });
                if (subject.length) {
                    subject = subject.join(' ');
                    if (subjects.indexOf(subject) < 0) {
                        subjects.push(subject);
                    }
                }
            });
            if (!subjects.length) subjects = null;
        }
        return subjects;
    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that returns the resource's tags
 *
 * @param  {Object}  record    Object containing record data
 * @return {Array}             Collection of tags
 */
var getResourceTags = module.exports.getResourceTags = function(record) {
    try {
        var tags = null;
        _.each(record.fields, function(row) {
            if (row['md_tags']) {
                tags = tags || [];
                var md_tags = row['md_tags'];
                _.each(md_tags, function(md_tag) {
                    var tag = md_tag['md_tags'];
                    if (tag && tag[1] && tag[1]['key'] === 'c' && parseInt(tag[1]['_'], 10) >= config.nodes['find-a-resource'].settings.minTagValue) {
                        tags.push(tag[0]['_']);
                    }
                });
            }
        });
        return tags;
    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that returns the resource's thumbnails
 *
 * @param  {Object}  record    Object containing record data
 * @return {Array}             Collection of thumbnail url's
 */
var getResourceThumbnails = module.exports.getResourceThumbnails = function(record) {
    try {
        var thumbnails = null;
        if (record.coverimageurl) {
            thumbnails = [record.coverimageurl];
            return thumbnails;
        }
        return thumbnails;
    } catch(error) {
        log().error(error);
        return null;
    }
};
