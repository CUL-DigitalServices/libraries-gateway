var _ = require('underscore');
var qs = require('querystring');
var request = require('request');
var xml2js = require('xml2js');

var config = require('../../../../config');
var search = require('../../../util/search');

var FacetModel = require('../../../models/search/facet');
var ResultModel = require('../../../models/search/result');
var ResultsModel = require('../../../models/search/results');

// Object that contains all the codes used to fetch the item properties
var keys = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
var propertyPaths = {
    'author': 'df100',
    'branch': 'h_df852',
    'date': 'df260',
    'isbn': 'df020',
    'note': 'df504',
    'physicalDescription': 'df300',
    'series': 'df490',
    'title': 'df245'
}

/**
 * Function that returns the results from Aquabrowser
 *
 * @see http://www.lib.cam.ac.uk/api/docs/ab_sru.htm
 * @see http://www.lib.cam.ac.uk/libraries/login/documentation/doc_Aquabrowser.html

 * Multiple formats
 * http://search.lib.cam.ac.uk/result.ashx?&q=title:Darwin format:book format:ebook&noext=false&searchmode=assoc&curpage=1&cmd=find&output=xml
 * http://search.lib.cam.ac.uk/result.ashx?&q=title%3ADarwin%20format%3Abook%20format%3Aebook&noext=false&searchmode=assoc&curpage=1&cmd=find&output=xml

 * All the facets
 * http://search.lib.cam.ac.uk/RefinePanel.ashx?inlibrary=true&noext=false&debug=&lastquery=Darwin&lvq=Darwin&lsi=user&uilang=en&searchmode=assoc&hardsort=def&skin=cambridge&rctx=AAMAAAABAAAAAwAAAE5BAQAJY2FtYnJpZGdlBkRhcndpbgZEYXJ3aW4AAAAAAARmaW5kBHVzZXIAAAADZGVmBHVzZXIFYXNzb2MBAAAAAAAAAAJlbgEA%2F%2F%2F%2F%2F9opAAAAAAAAAwAAAAZpXzM2MGkKdGY1bHU5eW01bgZjX292ZXIBMQRpX2ZrAAAAAAA%3D&c_over=1&curpage=1&concept=Darwin&branch=&ref=&i_fk=&mxdk=-2&undup=false&q=Darwin&si=user&cmd=refanalyze&t_dim=Format&t_method=-1&output=xml
 *
 * @param  {Boolean}    isAquabrowser       Indicates if Aquabrowser has been specified explicitly
 * @param  {String}     parameters          Query parameters
 * @param  {Function}   callback            The callback function
 * @param  {Error}      callback.error      Error object to be send with the callback function
 * @param  {Results[]}  callback.results    Collection of results to be send with the callback function
 */
var getResults = module.exports.getResults = function(isAquabrowser, parameters, callback) {

    // Check if we're looking for a specific resource (ID)
    var isDetailRequest = false;

    // The queryString variable only contains parameters for the items themselves
    var queryString = [];

    // The extraParams contain parameters to do the search in the external API
    var extraParams = ['cmd=find', 'output=xml', 'searchmode=assoc', 'noext=false'];

    // Check if a parameters object is specified
    if (parameters) {

        // Check if an ID is set (e.g. 123456)
        if (parameters['id']) {
            isDetailRequest = true;
            queryString.push('id:' + parameters['id']);

        } else {

            // Check if a query is set (e.g. Darwin)
            if (parameters['q']) {
                queryString.push(parameters['q']);
            }

            // Check if the format is set (e.g. books, journals...)
            if (parameters['format'] && parameters['format'] !== 'all') {
                var format = config.constants.formats[parameters['format']]['aquabrowser'];
                queryString.push('format:' + format);
            }

            // Parameters which can only be added if the API is specified in the UI (facets)
            if (isAquabrowser) {

                // Check if the author is set
                if (parameters['author']) {
                    // Empty untill we introduce the facets
                }

                // Check if the branch is set (e.g. University Main Library)
                if (parameters['branch']) {
                    extraParams.push('branch=' + parameters['branch']);
                }

                // Check if the current page is set (e.g. 2)
                if (parameters['page']) {
                    extraParams.push('curpage=' + parameters['page']);
                }
            }
        }
    }

    // Construct the url for the request
    extraParams.push('q=' + encodeURIComponent(queryString.join(' ')));
    var url = config.constants.engines.aquabrowser.uri + '?' + extraParams.sort().join('&');

    // Create an options object that can be submitted to the Aquabrowser API
    var options = {
        'url': url,
        'timeout': config.constants.engines.aquabrowser.timeout
    };

    // Perform the request to the Aquabrowser API
    request(options, function(err, res, body) {
        if (err) {
            return callback('An error occurred while fetching Aquabrowser data');
        }

        // Remove all the whitespaces and tags from the xml
        var xml = res.body.trim();
        xml = xml.replace(/<\/?exact>|<\/?nonexact>/g, '');

        // Create an options object for the JSON parsing
        var parseOpts = {
            'trim': true,
            'mergeAttrs': true,
            'explicitArray': false,
            'explicitChildren': true
        };

        // Parse the XML as a JSON string
        xml2js.parseString(xml, parseOpts, function(err, res) {
            if (err || !res.root) {
                return callback('An error occurred while fetching Aquabrowser data');
            }

            // Instantiate some variables
            var numRecords = 0;
            var facetCollection = [];
            var aquabrowserResults = [];
            var suggestions = null;

            try {
                // Loop all the facets from the result
                if (res.root.refine && res.root.refine.d) {

                    // Loop all the facet categories
                    var facetTypes = res.root.refine.d;
                    _.each(facetTypes, function(facetType) {

                        // Pick all the necessary properties from the facetType
                        var facetTypeLabel = facetType.rawlbl;
                        var facetTypeAmount = facetType.t;

                        // Create a new Facet model for each facet
                        var facets = [];
                        _.each(facetType.kw, function(facet) {

                            // Pick all the necessary properties from the facet
                            var facetLabel = facet.lbl;
                            var facetAmount = facet.c;

                            // Create a new facet model
                            var facetModel = new FacetModel.Facet(facetLabel, facetAmount);
                            facets.push(facetModel);
                        });

                        // Create a new FacetType model
                        var facetTypeModel = new FacetModel.FacetType(facetTypeLabel, facetTypeAmount, facets);
                        facetCollection.push(facetTypeModel);
                    });
                }
            } catch(e) {
                return callback('An error occurred while fetching Aquabrowser data');
            }

            // Loop all the Aquabrowser results
            try {
                if (!res.root.feedbacks.noresults) {
                    numRecords = res.root.feedbacks.standard.resultcount;

                    var records = res['root']['results']['record'];

                    if (isDetailRequest) {
                        // If the item occurs in multiple databases, it is returned as an array with multiple instances of itself.
                        // We select the first item since this is the most relevant one.
                        if (_.isArray(records)) {
                            records = records[0];
                        }
                        aquabrowserResults.push(_createResourceModel(records));
                    } else {
                        _.each(records, function(record, index) {
                            if (record.fields) {
                                aquabrowserResults.push(_createResourceModel(record));
                            }
                        });
                    }
                }
            } catch(e) {
                return callback('An error occurred while fetching Aquabrowser data');
            }

            // Create a pagination model
            try {

                // Initialize some variables
                var page = null;
                var pageNumber = 0;
                var pageCount = 0;
                var firstPage = 0;
                var lastPage = 0;

                // Since we don't want to have changes in our original query object, we need to clone the parameters
                var params = _.clone(parameters);
                params.api = 'aquabrowser';

                // If pager information is available
                if (res.root.feedbacks.pager) {

                    // Store the pagination information
                    pager = res.root.feedbacks.pager;

                    pageNumber = parseInt(pager.currentpage, 10);

                    // We only support the first 50 pages of the results
                    pageCount = parseInt(pager.totalpages, 10);
                    if (pageCount > config.constants.search.pageLimit) pageCount = config.constants.search.pageLimit;

                    firstPage = 1;

                    lastPage = parseInt(pager.totalpages, 10);
                    if (lastPage > config.constants.search.pageLimit) lastPage = config.constants.search.pageLimit;

                // If no pager information is available, but standard feedback is provided
                } else if (res.root.feedbacks.standard) {

                    // Store the pagination information
                    pager = res.root.feedbacks.standard;

                    pageNumber = parseInt(pager.currentpage, 10);
                    pageCount = firstPage = lastPage = 1;
                }

                var pagination = search.createPaginationModel(params, pageNumber, pageCount, firstPage, lastPage);

            } catch(e) {
                return callback('An error occurred while fetching Aquabrowser data');
            }

            // Only if no records are found, we request the suggestions from the Aquabrowser API
            if (numRecords === 0) {
                _getSuggestions(params, function(err, suggestions) {
                    if (err) {
                        return callback('An error occurred while fetching Aquabrowser data');
                    }

                    // Put all the result models into a containing results model
                    var results = new ResultsModel.Results(numRecords, facetCollection, aquabrowserResults, pagination, suggestions);
                    return callback(null, results);
                });

            // If records are found
            } else {
                // Put all the result models into a containing results model
                var results = new ResultsModel.Results(numRecords, facetCollection, aquabrowserResults, pagination, null);
                return callback(null, results);
            }
        });
    });
};

/**
 * Function that creates a resource model
 *
 * @param  {Object}       record    The resource record
 * @return {ResultModel}            The returned property value
 * @api private
 */
var _createResourceModel = function(record) {

    // Initialize some variables
    var id = null;
    var extId = null;
    var title = null;
    var isbn = null;
    var author = null;
    var date = null;
    var physicalDescription = null;
    var series = null;
    var note = null;
    var contentType = null;
    var thumbnail = null;
    var link = null;
    var branches = null;

    // Check if the record has a fields object
    if (record.fields) {
        if (record.fields[0]) {
            id = record.fields[0].id;
        } else {
            id = record.fields.id;
        }

        if (record.fields[1]) {
            title = record.fields[1].title;
            author = record.fields[1].author;
        } else {
            title = record.fields.title;
            author = record.fields.creator;
        }
    }

    // Check if the record has a data object
    if (record.d) {
        title = _getItemProperty(record, propertyPaths.title, ' ');
        isbn = _getItemProperty(record, propertyPaths.isbn, ', ');
        author = _getItemProperty(record, propertyPaths.author, ' ');
        date = _getItemProperty(record, propertyPaths.date, ' ');
        physicalDescription = _getItemProperty(record, propertyPaths.physicalDescription, ' ');
        series = _getItemProperty(record, propertyPaths.series, ' ');
        note = _getItemProperty(record, propertyPaths.note, ', ');
        contentType = _getItemData(record, 'fields', 0, 'material_t');
        thumbnail = _getItemThumbnail(record);
        branches = _getItemBranches(record);
    }

    // Check if the record has an external ID
    if (record.extID) {
        extId = record.extID;
    }

    // Since some resources can have multiple valies for a property, we need to make sure they are always returned as an array,
    // even when they only have one value. We loop all the properties in the templates.
    if (id !== null && !_.isArray(id)) id = [id];
    if (title !== null && !_.isArray(title)) title = [title];
    if (author !== null && !_.isArray(author)) author = [author];

    // Create a new model for each result and add it to the result collection
    return new ResultModel.Result(id, extId, title, isbn, null, null, null, author, date, physicalDescription, series, note, contentType, thumbnail, link, branches);
};

/**
 * Function that gets the branches of the item out of the record
 *
 * @param  {Object}    record    Object containing the record data
 * @return {Branch[]}            Collection of branches
 * @api private
 */
var _getItemBranches = function(record) {

    // If the record doesn't contain detail information, we return an empty array
    if (!record.d) {
        return [];
    }

    // Store the branch data from the record
    var recordBranches = record.d[1][propertyPaths.branch];

    // Create an empty array to store the branches
    var _branches = [];

    /**
     * Function that creates and adds a new branch object to the branch collection
     *
     * @param  {Object}  data    Object containing information about the branch
     * @api private
     */
    var _addBranch = function(data) {
        var branch = {
            'classmark': _getProperty(data, propertyPaths.branch, 'h'),
            'code': _getProperty(data, propertyPaths.branch, 'b'),
            'type': _getProperty(data, propertyPaths.branch, '2'),
            'name': _getProperty(data, propertyPaths.branch, '9')
        };
        _branches.push(branch);
    };

    // When an item is available in multiple libraries, it is returned as an array
    if (_.isArray(recordBranches)) {
        _.each(recordBranches, _addBranch);
    } else {
        _addBranch(recordBranches);
    }

    return _branches;
};

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
    } catch(e) {
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
            } else {
                if (data[0][property]) {
                    values = [];
                    _.each(data[0][property], function(row) {
                        if (keys.indexOf(row.key) > -1 && row._) {
                            values.push(row._);
                        }
                    });
                    return [values.join(separator)];
                }
            }
        }
        return values;
    } catch(e) {
        return null;
    }
};

/**
 * Function that fetches the item's thumbnail
 *
 * @param  {Object}  record    Object containing record data
 * @return {Array}             The returned thumbnail url returned as collection item
 * @api private
 */
var _getItemThumbnail = function(record) {
    var thumbnail = null;
    if (record.coverimageurl) {
        thumbnail = [record.coverimageurl];
    }
    return thumbnail;
};

/**
 * Function that picks a property out of the branch
 *
 * @param  {Property[]}  properties     Collection containing all the branch properties
 * @param  {String}      key            The properties' key needed to fetch the value
 * @return {String}                     The returned property value
 * @param  {Object}      suggestions    Object containing suggestions information
 * @api private
 */
var _getProperty = function(properties, index, key) {
    if (!properties[index]) return null;
    var value = _.find(properties[index], function(property) { return property['key'] === key; });
    return (value) ? value['_'] : null;
};

/**
 * Function that creates a suggestions model for the search results
 *
 * @param  {Object}       parameters              Query parameters
 * @param  {Function}     callback                Standard callback function
 * @param  {Error}        callback.error          Error object to be send with the callback function
 * @param  {Suggestions}  callback.suggestions    Collection of suggestions to be send with the callback function
 * @api private
 */
var _getSuggestions = function(parameters, callback) {

    // Clone the parameters object
    var params = _.clone(parameters);

    // Initialize some variables
    var originalQuery = null;
    var suggestedItems = [];

    // Construct the request url
    var url = config.constants.engines.aquabrowser.uri_suggestions + '?q=' + parameters.q;

    // Do a request to the Aquabrowser API
    request({'url': url}, function(err, res, body) {
        if (err) {
            return callback('An error occurred while fetching Aquabrowser data');
        }

        // Create an options object for the JSON parsing
        var parseOpts = {
            'trim': true,
            'mergeAttrs': true
        };

        try {
            // Parse the returned XML
            xml2js.parseString(body, parseOpts, function(err, res) {
                if (err || !res.cloud) {
                    return callback('An error occurred while fetching Aquabrowser data');
                }

                // Fetch the original entered query
                if (res.cloud.concept) {
                    originalQuery = res.cloud.concept[0];
                }

                // Fetch the suggestions
                _.each(res.cloud.i, function(row) {
                    if (row._) {

                        // Replace the existing query in the parameters query
                        params.q = row._;

                        var label = params.q;
                        var url = qs.stringify(params);

                        // Create a new suggestion model
                        var suggestionModel = new ResultsModel.Suggestion(label, url);
                        suggestedItems.push(suggestionModel);
                    }
                });

                // Return the suggestions
                var suggestionsModel = new ResultsModel.Suggestions(originalQuery, suggestedItems);
                return callback(null, suggestionsModel);
            });
        } catch(e) {
            return callback('An error occurred while fetching Aquabrowser data');
        }
    });
};
