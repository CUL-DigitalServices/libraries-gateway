var _ = require('underscore');
var request = require('request');
var xml2js = require('xml2js');

var config = require('../../../../config');

var FacetModel = require('../../../models/search/facet');
var ResultModel = require('../../../models/search/result');
var ResultsModel = require('../../../models/search/results');

// Object that contains all the codes used to fetch the item properties
var properyPaths = {
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
 * @param  {String}     _queryString        Querystring
 * @param  {Function}   callback            The callback function
 * @param  {Error}      callback.error      Error object to be send with the callback function
 * @param  {Results[]}  callback.results    Collection of results to be send with the callback function
 */
var getResults = module.exports.getResults = function(_queryString, callback) {
    
    // The queryString variable only contains parameters for the items themselve
    var queryString = ['title:' + _queryString['q']];

    // The extreParams contain parameters to do the search in the external API
    var extraParams = ['cmd=find', 'output=xml'];

    // Check if the format is set
    if (_queryString && _queryString['format'] && _queryString['format'] !== 'all') {
        var format = config.constants.formats[_queryString['format']]['aquabrowser'];
        queryString.push('format:' + format);        
    }

    // Check if a limit is set for items per page
    var limit = 50;
    if (_queryString && _queryString['records']) {
        extraParams.push('maximumRecords=' + limit);
    }

    // Check if the branch is set
    if (_queryString && _queryString['branch']) {
        extraParams.push('branch=' + _queryString['branch']);
    }

    // Check if the current page is set
    if (_queryString && _queryString['page']) {
        extraParams.push('curpage=' + _queryString['page']);
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

        // Remove all the whitespace characters from the xml
        var xml = res.body.trim();

        // Create an options object for the JSON parsing
        var parseOpts = {
            'trim': true, 
            'mergeAttrs': true, 
            'explicitArray': false
        };

        // Parse the XML as a JSON string
        var jsonstring = xml2js.parseString(xml, parseOpts, function(err, res) {
            if (err || !res.root) {
                return callback('An error occurred while fetching Aquabrowser data');
            }

            // Create a new array for the facets
            var facetCollection = [];

            // Loop all the facets from the result
            try {
                if (res.root.refine) {

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
            } catch (e) {
                return callback('An error occurred while fetching Aquabrowser data');
            }

            // Create a new array for all the Aquabrowser resources
            var aquabrowserResults = [];

            // Loop all the Aquabrowser results
            try {
                var numRecords = 0;
                if (!res.root.feedbacks.noresults) {
                    numRecords = res.root.feedbacks.standard.resultcount;

                    var records = res['root']['results']['record'];
                    _.each(records, function(record, index) {
                        if (record.fields) {

                            // Fill up the record properties
                            var id = getItemData(record, 'fields', 0, 'id');
                            var title = getItemTitle(record);
                            var author = getItemAuthor(record);
                            var date = getItemData(record, 'fields', 0, 'publisheryear');
                            var contentType = getItemData(record, 'fields', 0, 'material_t')[0];
                            var thumbnail = record.coverimageurl || null;
                            var branches = getItemBranches(record.d[1][properyPaths.branch]);

                            // Create a new model for each result and add it to the result collection
                            var result = new ResultModel.Result(id, title, author, date, contentType, thumbnail, branches);
                            aquabrowserResults.push(result);
                        }
                    });
                }
            } catch (e) {
                return callback('An error occurred while fetching Aquabrowser data');
            }

            // Put all the result models into a containing results model
            var results = new ResultsModel.Results(numRecords, facetCollection, aquabrowserResults);
            return callback(null, results);
        });
    });
};

/**
 * Function that picks a property out of the branch
 * 
 * @param  {Property[]}  properties    Collection containing all the branch properties
 * @param  {String}      key           The properties' key needed to fetch the value
 * @return {String}                    The returned property value
 * @api private
 */
var getProperty = function(properties, index, key) {
    if (!properties[index]) return null;
    var value = _.find(properties[index], function(property) { return property['key'] === key; });
    return (value) ? value['_'] : null;
};

/**
 * Function that gets d/field properties of the item record
 *
 * @param  {Object}    record    Object containing item information
 * @param  {String}    root      The object root
 * @param  {Number}    index     The index of the collection
 * @param  {String}    key       The key of the property
 * @return {String}              The returned value
 * @api private
 */
var getItemData = function(record, root, index, key) {
    try {
        return record[root][0][key] || null;
    } catch (e) {
        return null;
    }
};

/**
 * Function that picks the title from an item record
 * 
 * @param  {Object}  record    Object containing record data
 * @return {String}            The title
 * @api private
 */
var getItemTitle = function(record) {
    try {
        var data = getItemData(record, 'd', 0, properyPaths.title);
        var title = '';
        if (data[properyPaths.title]) {

            // First check if the returned title contains a matching element
            var value = _.find(data[properyPaths.title], function(property) { return property['exact'] });
            if (value && value['exact']) title += value['exact'];

            // Only add the divider to the string if a subtitle is provided
            var subtitle = getProperty(data, properyPaths.title, 'b');
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
 * Function that picks the author from an item record
 *
 * @param  {Object}  record    Object containing record data
 * @return {String}            The author
 * @api private
 */
var getItemAuthor = function(record) {
    try {
        return getProperty(getItemData(record, 'd', 0, properyPaths.author), properyPaths.author, 'a');
    } catch (e) {
        return null;
    }
};

/**
 * Function that gets the branches of the item out of the record
 *
 * @param  {Object}    branches    Object containing the branches where the item is stored
 * @return {Branch[]}              Collection of branches
 * @api private
 */
var getItemBranches = function(branches) {

    // Create an empty array to store the branches
    var _branches = [];

    /**
     * Function that creates a new branch object with the necessary properties
     * 
     * @param  {Object}  data    Object containing information about the branch
     * @api private
     */
    var _createBranch = function(data) {
        var branch = {
            'code': getProperty(data, properyPaths.branch, 'b'),
            'type': getProperty(data, properyPaths.branch, '2'),
            'name': getProperty(data, properyPaths.branch, '9')
        };
        _branches.push(branch);
    };

    // When an item is available in multiple libraries, it is returned as an array
    if (_.isArray(branches)) {
        _.each(branches, function(branch) {
            _createBranch(branch);
        });
    } else {
        _createBranch(branches);
    }

    return _branches;
};
