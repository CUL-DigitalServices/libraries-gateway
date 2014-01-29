var _ = require('underscore');

var config = require('../../../../../../config');

var libUtil = require('../../../../../util/util');
var log = require('../../../../../util/logger').logger();

var searchUtil = require('../../../../../util/search');

var ResultModel = require('../../../../../models/search/result');

var ResourceModelFactory = require('../../../../../factories/api/search/ResourceModelFactory');

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
    try {
        var values = [];
        var data = _getItemData(record, 'd', 0, property);
        if (data !== null) {
            if (data.length > 1) {
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
                _.each(data[0][property], function(row) {
                    if (keys.indexOf(row.key) > -1 && row._) {
                        values.push(row._);
                    }
                });
                return [values.join(separator)];
            }
        }
        if (values && !values.length) values = null;
        return values;
    } catch(error) {
        log().warn(error);
        return null;
    }
};

/**
 * Function that constructs the request url
 *
 * @param  {String}   uri              The request uri (e.g. http://search.lib.cam.ac.uk/RefinePanel.ashx)
 * @param  {Boolean}  isAquabrowser    Indicates if Aquabrowser has been specified explicitly
 * @param  {Object}   parameters       The query parameters (e.g. id, branch...)
 * @param  {Array}    extraParams      Extra API bound request parameters (e.g. output...)
 * @param  {Object}   options          Request options object
 */
var constructRequestOptions = module.exports.constructRequestOptions = function(uri, isAquabrowser, parameters, extraParams) {

    // The queryString variable only contains parameters for the items themselves
    var queryString = [];

    // Check if an ID is set (e.g. 123456)
    if (parameters['id']) {
        queryString.push('id:' + parameters['id']);

    } else {

        // Check if a query is set (e.g. Darwin)
        if (parameters['q']) {
            queryString.push(parameters['q']);
        }

        // Parameters which can only be added if the API is specified in the UI (facets)
        if (isAquabrowser) {

            // Aquabrowser additional search parameters

            // Check if the branch is set (e.g. University Main Library)
            if (parameters['branch']) {
                extraParams.push('branch="' + parameters['branch'] + '"');
            }

            // Check if the current page is set (e.g. 2)
            if (parameters['page']) {
                extraParams.push('curpage=' + parameters['page']);
            }

            // Aquabrowser query parameters

            // Check if the format is set (e.g. `books`, `journals`,...)
            if (parameters['format'] && parameters['format'] !== 'all') {
                queryString.push('format:"' + parameters['format'] + '"');
            }

            // Check if the author is set (e.g.`Charles Darwin`)
            if (parameters['author']) {
                queryString.push('author:"' + parameters['author'] + '"');
            }

            // Check if the language is set (e.g. `English`, `German`,...)
            if (parameters['language']) {
                 queryString.push('language:"' + parameters['language'] + '"');
            }

            // Check if the MDTags are set (e.g. `evolution`, `science`, `darwin`,...)
            if (parameters['mdtags']) {
                 queryString.push('mdtags:"' + parameters['mdtags'] + '"');
            }

            // Check if the person is set (e.g. `Darwin, Charles`, `Huxley, Thomas Henry`,...)
            if (parameters['person']) {
                 queryString.push('person:"' + parameters['person'] + '"');
            }

            // Check if the region is set (e.g. `England`, `Great Britain`,...)
            if (parameters['region']) {
                 queryString.push('region:"' + parameters['region'] + '"');
            }

            // Check if the series parameter is set (e.g. `The Pickering masters`,`The works of Charles Darwin`,...)
            if (parameters['series']) {
                 queryString.push('series:"' + parameters['series'] + '"');
            }

            // Check if the subject is set (e.g. `Evolution`, `Natural selection`,...)
            if (parameters['subject']) {
                 queryString.push('subject:"' + parameters['subject'] + '"');
            }

            // Check if the timeperiod is set (e.g. `19th century`, `20th century`,...)
            if (parameters['timeperiod']) {
                 queryString.push('timeperiod:"' + parameters['timeperiod'] + '"');
            }

            // Check if the uniform title is set (e.g. `On the origin of species`,...)
            if (parameters['uniformtitle']) {
                 queryString.push('uniformtitle:"' + parameters['uniformtitle'] + '"');
            }
        }
    }

    // Construct the url for the request
    extraParams.push('q=' + encodeURIComponent(queryString.join(' ')));
    var url = uri + '?' + extraParams.sort().join('&');

    // Create an options object that can be submitted to the Aquabrowser API
    var options = {
        'url': url,
        'timeout': config.constants.engines.aquabrowser.timeout
    };

    // Return the options
    return options;
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
        var authors = [];
        var marc = 'df100';
        if (record.d && record.d[0]){
            var data = record.d[0];
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

        } else if (record.fields) {
            if (_.isArray(record.fields)) {
                _.each(record.fields, function(row) {
                    if (row.author) {
                        var authorModel = new ResultModel.Author(row.author);
                        authors.push(authorModel);
                    } else {
                        _.each(row.creator, function(item) {
                            authors.push(new ResultModel.Author(item));
                        });
                    }
                });
            } else {
                if (_.isArray(record.fields.creator)) {
                    _.each(record.fields.creator, function(item) {
                        var authorModel = new ResultModel.Author(item);
                        authors.push(authorModel);
                    });
                } else {
                    authors.push(new ResultModel.Author(record.fields.creator));
                }
            }
        }
        if (authors && !authors.length) authors = null;
        return authors;
    } catch(error) {
        log().error(error);
        return authors;
    }
};

/**
 * Function that returns the resouce's holding branches
 *
 * @param  {Object}  record    Object containing record data
 * @return {Array}             Collection of branches
 */
var getResourceBranches = module.exports.getResourceBranches = function(record) {
    try {

        /**
         * Internal function that collects the data before creating a model
         *
         * @param  {Object}  branch    Object containing branch data
         * @return {Branch}            Created branch model
         * @api private
         */
        var _createModel = function(branch) {
            return ResourceModelFactory.createBranchModel({
                'name': _.where(branch, {'key': '9'})[0]['_'],
                'classmark': _.where(branch, {'key': 'h'})[0]['_'],
                'status': null,
                'numberOfItems': null
            });
        };

        var marc = 'h_df852';
        var branches = [];
        var totalBranches = 0;

        if (record.d) {
            var items = _.find(record.d, function(node) { return node[marc]; });
            if (_.isArray(items[marc])) {
                totalBranches = items[marc].length;
                items[marc] = items[marc].slice(0,config.nodes['find-a-resource'].settings.numberOfHoldingsShown);
                _.each(items[marc], function(item) {
                    branches.push(_createModel(item[marc]));
                });
            } else {
                totalBranches = 1;
                branches.push(_createModel(items[marc][marc]));
            }
        }

        // Return the results
        if (branches && !branches.length) branches = null;
        return new ResultModel.Branches(totalBranches, branches);

    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that returns the resource's content type
 *
 * @param  {Object}  record    Object containing record data
 * @return {Array}             Collection of content types
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
};

/**
 * Function that returns the resource's description
 *
 * @param  {Object}  record    Object containing record data
 * @return {String}            The resouce description
 */
var getResourceDescription = module.exports.getResourceDescription = function(record) {
    try {
        var description = null;
        if (record.summary && record.summary['_']) {
            description = record.summary['_'];
        } else if (record.fields) {
            if (_.isArray(record.fields)) {
                _.each(record.fields, function(row) {
                    description = libUtil.consolidateValue(row.description);
                });
            } else if (record.fields.description) {
                description = libUtil.consolidateValue(record.fields.description);
            }
        }
        return description;
    } catch(error) {
        log().error(error);
        return null;
    }
};

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
 * MARC21: df020
 *
 * @param  {Object}  record    Object containing record data
 * @return {String}            Collection of resource ISBN's
 */
var getResourceISBN = module.exports.getResourceISBN = function(record) {
    try {
        var isbn = null;
        var marc = 'df020';
        if (record.d) {
            isbn = _getItemProperty(record, marc, ', ');
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
 * MARC21: df504
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
        var titles = [];
        var marc = 'df245';
        if (record.d && record.d[0]){
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
            if (_.isArray(record.fields)) {
                _.each(record.fields, function(row) {
                    if (row.title) titles.push(row.title);
                });
            } else if (record.fields.title) {
                titles.push(record.fields.title);
            }
        }
        if (titles && !titles.length) titles = null;
        return titles;
    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that returns the resource's publication data
 * MARC21: df260
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
        var publicationPublisher = [];
        if (record.d && record.d[0]) {
            var data = record.d[0];
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
            if(_.isArray(record.fields)) {
                _.each(record.fields, function(row) {
                    if (row.publisheryear) year = row.publisheryear;
                    if (row.publisher) {
                        publicationPublisher.push(row.publisher);
                    }
                });
            } else if (record.fields) {
                if (record.fields.publisher) {
                    publicationPublisher.push(record.fields.publisher);
                }
            }
        }
        if (publicationPublisher && !publicationPublisher.length) publicationPublisher = null;

        // Date
        var lblDate = _.compact([day, month, year]).join('-');
        var publicationDate = new ResultModel.PublicationDate(day, month, year, lblDate);

        // Volume
        var publicationVolume = [];
        if (record.d && record.d[0]) {
            var data = record.d[0];
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
        if (publicationVolume && !publicationVolume.length) publicationVolume = null;

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
        var series = [];
        if (record.d && record.d[0]){
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
        }
        if (series && !series.length) series = null;
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
        return libUtil.consolidateValue(record.src);
    } catch(error) {
        log().error(error);
        return null;
    }
};

/**
 * Function that returns that resource's subject
 * MARC21: df650
 *
 * @param  {Object}  record    Object containing record data
 * @return {Array}             Collection of subjects
 */
var getResourceSubjects = module.exports.getResourceSubjects = function(record) {
    try {
        var marc = 'df650';
        var subjects = [];
        if (record.d && record.d[0]) {
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
        } else if (record.fields) {
            if (_.isArray(record.fields)) {
                _.each(record.fields, function(row) {
                    if (row.subject) {
                        if (_.isArray(row.subject)) {
                            _.each(row.subject, function(item) {
                                subjects.push(item);
                            });
                        } else {
                            subjects.push(row.subject);
                        }
                    }
                });
            } else {
                if (record.fields.subject) {
                    subjects = record.fields.subject;
                }
            }
        }
        if (subjects && !subjects.length) subjects = null;
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
        var tags = [];
        _.each(record.fields, function(row) {
            _.each(row['md_tags'], function(md_tag) {
                var tag = md_tag['md_tags'];
                if (tag && tag[1] && tag[1]['key'] === 'c' && parseInt(tag[1]['_'], 10) >= config.nodes['find-a-resource'].settings.minTagValue) {
                    tags.push(tag[0]['_']);
                }
            });
        });
        if (tags && !tags.length) tags = null;
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
        var thumbnails = [];
        if (record.coverimageurl) {
            thumbnails = libUtil.putInArrayIfNotNull(record.coverimageurl);
            return thumbnails;
        }
        if (thumbnails && !thumbnails.length) thumbnails = null;
        return thumbnails;
    } catch(error) {
        log().error(error);
        return null;
    }
};
