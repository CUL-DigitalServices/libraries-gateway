var _ = require('underscore');
var request = require('request');
var xml2js = require('xml2js');

var config = require('../../../../config');
var search = require('../../../util/search');

var FacetModel = require('../../../models/search/facet');
var ResultModel = require('../../../models/search/result');
var ResultsModel = require('../../../models/search/results');

// Object that contains all the codes used to fetch the item properties
var propertyPaths = {
    'isbn': 'df020',
    'author': 'df100',
    'branch': 'h_df852',
    'title': 'df245',
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
 * @param  {Boolean}      isAquabrowser       Indicates if Aquabrowser has been specified explicitly
 * @param  {String}       parameters          Query parameters
 * @param  {Function}     callback            The callback function
 * @param  {Error}        callback.error      Error object to be send with the callback function
 * @param  {Results[]}    callback.results    Collection of results to be send with the callback function
 */
var getResults = module.exports.getResults = function(isAquabrowser, parameters, callback) {

    // Check if we're looking for a specific resource (ID)
    var isDetailRequest = false;

    // The queryString variable only contains parameters for the items themselves
    var queryString = [];

    // The extraParams contain parameters to do the search in the external API
    var extraParams = ['cmd=find', 'output=xml', 'maximumRecords=10'];

    // Check if a parameters object is specified
    if (parameters) {

        // Check if an ID is set (e.g. 123456)
        if (parameters['id']) {
            isDetailRequest = true;
            queryString.push('bibno:' + parameters['id']);

        } else {

            // Check if a query is set (e.g. Darwin)
            if (parameters['q']) {
                queryString.push('title:' + parameters['q']);
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
    extraParams.push('q=' + encodeURIComponent(queryString.join(' ')))
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
        xml = xml.replace(/<exact>/g,'').replace(/<\/exact>/g,'');
        xml = xml.replace(/<nonexact>/g,'').replace(/<\/nonexact>/g,'');

        // Create an options object for the JSON parsing
        var parseOpts = {
            'trim': true,
            'mergeAttrs': true,
            'explicitArray': false,
            'explicitChildren': true
        };

            // Parse the XML as a JSON string
            var jsonstring = xml2js.parseString(xml, parseOpts, function(err, res) {
                if (err || !res.root) {
                    return callback('An error occurred while fetching Aquabrowser data');
                }

                // Instantiate some variables
                var numRecords = 0;
                var facetCollection = [];
                var aquabrowserResults = [];

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
                    var pagination = null;

                    // If the query produced resulsts
                    if (!res.root.feedbacks.noresults) {

                        // If pager information is available
                        if (res.root.feedbacks.pager) {

                            // Store the pagination information
                            var pager = res.root.feedbacks.pager;

                            var pageNumber = parseInt(pager.currentpage, 10);

                            // We only support the first 50 pages of the results
                            var pageCount = parseInt(pager.totalpages, 10);
                            if (pageCount > 50) pageCount = 50;

                            var firstPage = 1;

                            var lastPage = parseInt(pager.totalpages, 10);
                            if (lastPage > 50) lastPage = 50;

                            parameters.api = 'aquabrowser';

                            pagination = search.createPaginationModel(parameters, pageNumber, pageCount, firstPage, lastPage);

                        // If no pager information is available
                        } else {
                            pagination = search.createPaginationModel(parameters, 1, 1, 1, 1);
                        }
                    }

                } catch(e) {
                    return callback('An error occurred while fetching Aquabrowser data');
                }

                // Put all the result models into a containing results model
                var results = new ResultsModel.Results(numRecords, facetCollection, aquabrowserResults, pagination);
                return callback(null, results);
            });
    });
};

/**
 * Function that creates a resource model
 *
 * @param  {Object}       record              The resource record
 * @return {ResultModel}                      The returned property value
 * @api private
 */
var _createResourceModel = function(record) {

    // Fill up the record properties
    var id = _getItemData(record, 'fields', 0, 'id').slice(1);
    var title = _getItemTitle(record);
    var isbn = _getItemISBN(record);
    var author = _getItemAuthor(record);
    var date = _getItemData(record, 'fields', 0, 'publisheryear');
    var contentType = _getItemData(record, 'fields', 0, 'material_t')[0];
    var thumbnail = record.coverimageurl || null;
    var branches = _getItemBranches(record);

    // Create a new model for each result and add it to the result collection
    var result = new ResultModel.Result(id, title, isbn, null, null, null, author, date, contentType, thumbnail, branches);
    return result;
};

/**
 * Function that picks the author from an item record
 *
 * @param  {Object}       record              Object containing record data
 * @return {String}                           The item's author
 * @api private
 */
var _getItemAuthor = function(record) {
    try {
        return _getProperty(_getItemData(record, 'd', 0, propertyPaths.author), propertyPaths.author, 'a');
    } catch (e) {
        return null;
    }
};

/**
 * Function that gets the branches of the item out of the record
 *
 * @param  {Object}       record              Object containing the record data
 * @return {Branch[]}                         Collection of branches
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
 * @param  {Object}       record              Object containing item information
 * @param  {String}       root                The object root
 * @param  {Number}       index               The index of the collection
 * @param  {String}       key                 The key of the property
 * @return {String}                           The returned value
 * @api private
 */
var _getItemData = function(record, root, index, key) {
    try {
        return record[root][0][key] || null;
    } catch (e) {
        return null;
    }
};

/**
 * Function that picks the ISBN from an item record
 *
 * @param  {Object}       record              Object containing record data
 * @return {String}                           The item's ISBN
 * @api private
 */
var _getItemISBN = function(record) {
    try {
        return _getProperty(_getItemData(record, 'd', 0, propertyPaths.isbn), propertyPaths.isbn, 'a');
    } catch (e) {
        return null;
    }
};

/**
 * Function that picks the title from an item record
 *
 * @param  {Object}       record              Object containing record data
 * @return {String}                           The title
 * @api private
 */
var _getItemTitle = function(record) {
    try {
        var data = _getItemData(record, 'd', 0, propertyPaths.title);
        var title = '';
        if (data[propertyPaths.title]) {
            var titleDate = Object.keys(data[propertyPaths.title]);
            var keys = ['a','b','c'];
            _.each(data[propertyPaths.title], function(foo) {
                if (keys.indexOf(foo.key) > -1) {
                    if (foo.exact) {
                        if (_.isArray(foo.exact)) {
                            title += foo.exact.join(' ');
                        } else {
                            title += foo.exact;
                        }
                    }
                    if (foo._) {
                        title += foo._ + ' ';
                    }
                }
            });

            // First check if the returned title contains a matching element
            var value = _.find(data[propertyPaths.title], function(property) { return property['exact'] });
            if (value && value['exact']) title += value['exact'];
            if (value && value['_']) title += value['_'];

            // Only add the divider to the string if a subtitle is provided
            var subtitle = _getProperty(data, propertyPaths.title, 'b');
            if (subtitle) {
                if (value && value['_']) title += value['_'] + ' ';
                title += subtitle;
            }
        }
        return title;
    } catch (e) {
        return null;
    }
};

/**
 * Function that picks a property out of the branch
 *
 * @param  {Property[]}   properties          Collection containing all the branch properties
 * @param  {String}       key                 The properties' key needed to fetch the value
 * @return {String}                           The returned property value
 * @api private
 */
var _getProperty = function(properties, index, key) {
    if (!properties[index]) return null;
    var value = _.find(properties[index], function(property) { return property['key'] === key; });
    return (value) ? value['_'] : null;
};
