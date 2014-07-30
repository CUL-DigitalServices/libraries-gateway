/*!
 * Copyright 2014 Digital Services, University of Cambridge Licensed
 * under the Educational Community License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

var _ = require('underscore');
var qs = require('querystring');
var request = require('request');
var util = require('util');
var xml2js = require('xml2js');

var config = require('../../../../../config');
var log = require('../../../../util/logger').logger();
var searchUtil = require('../../../../util/search');
var FacetModel = require('../../../../models/search/facet');
var ResultModel = require('../../../../models/search/result');
var ResultsModel = require('../../../../models/search/results');
var ResourceModelFactory = require('../../../../factories/api/search/ResourceModelFactory');

var AquabrowserUtil = require('./util/util');

////////////////////////
//  PUBLIC FUNCTIONS  //
////////////////////////

/**
 * Function that returns the facets from Aquabrowser
 * @see http://search.lib.cam.ac.uk/RefinePanel.ashx?mxdk=-2&q=Darwin&output=xml
 *
 * @param  {Object}    parameters          The query parameters
 * @param  {Function}  callback            The callback function
 * @param  {Error}     callback.error      The thrown error
 * @param  {Results}   callback.results    The created results model
 */
var getFacetsFromResults = module.exports.getFacetsFromResults = function(parameters, callback) {

    // The extra parameters to execute the search in the external API
    var extraParams = ['mxdk=-2', 'output=xml'];
    // The API endpoint
    var uri = config.constants.engines.aquabrowser.uri_facets;
    // Predefine some queryString elements
    var queryString = [];
    // Construct the request options object
    var url = AquabrowserUtil.constructRequestUrl(uri, parameters, extraParams);

    // Request options object
    var options = {
        'url': url,
        'timeout': config.constants.engines.aquabrowser.timeout
    };

    // Send request to Aquabrowser API
    request(options, function(error, response, results) {
        if (error) {
            log().error(error);
            return callback({'code': 500, 'msg': 'An error occurred while fetching Aquabrowser facets'});
        }

        try {

            // Create an options object for the JSON parsing
            var parseOptions = {
                'explicitArray': false,
                'explicitChildren': false,
                'mergeAttrs': true,
                'trim': true
            };

            // Parse the XML body
            xml2js.parseString(results, parseOptions, function(error, results) {

                if (error) {
                    log().error(error);
                    return callback(error);
                }

                // Fetch all the facets from the results
                _getFacets(results.root.analysis.d, parameters, function(error, facetsCollection) {
                    if (error) {
                        log().error(error);
                        return callback(error);
                    }

                    // Return the facets
                    return callback(null, facetsCollection);
                });
            });

        } catch(error) {
            log().error(error);
            return callback(error);
        }
    });
};

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
 * Availability
 * http://search.lib.cam.ac.uk/availability.ashx?hreciid=[RESOURCE-ID]&output=xml
 *
 * @param  {String}     parameters          The query parameters
 * @param  {Function}   callback            The callback function
 * @param  {Error}      callback.error      Error object to be send with the callback function
 * @param  {Results[]}  callback.results    Collection of results to be send with the callback function
 */
var getResults = module.exports.getResults = function(parameters, callback) {

    // The extra parameters to execute the search in the external API
    var extraParams = ['output=xml'];

    // Check if we're looking for a specific resource (ID)
    var isDetailRequest = _.has(parameters, 'id');

    // Create an options object that can be submitted to the Aquabrowser API
    var queryString = AquabrowserUtil.constructRequestQueryString(parameters, extraParams);

    // Execute the query
    _executeQuery(queryString, function(err, results) {

        // Initialize some variables
        var numRecords = 0;
        var aquabrowserResults = [];
        var facets = [];
        var filters = [];

        try {

            /**
             * Function that creates models for objects which should always be present, even if no results are found
             *
             * @api private
             */
            var _createGlobalInformation = function() {

                // Get the pagination
                _getPagination(results, parameters, function(error, pagination) {
                    if (error) {
                        log().error(error);
                        return callback({'code': 500, 'msg': 'An error occurred while fetching Aquabrowser data'});
                    }

                    // Only if no records are found, we request the suggestions from the Aquabrowser API
                    var suggestions = null;
                    if (numRecords === 0) {
                        _getSuggestions(parameters, function(error, suggestions) {
                            if (error) {
                                return callback({'code': 500, 'msg': 'An error occurred while fetching Aquabrowser data'});
                            }

                            // Put all the result models into a containing results model
                            var results = new ResultsModel.Results(numRecords, facets, filters, aquabrowserResults, pagination, suggestions);
                            return callback(null, results);
                        });

                    // If records are found
                    } else {

                        // Put all the result models into a containing results model
                        var results = new ResultsModel.Results(numRecords, facets, filters, aquabrowserResults, pagination, suggestions);
                        return callback(null, results);
                    }
                });
            }

            // If no matching records were found
            if (results.root.feedbacks.noresults) {

                _createGlobalInformation();

            // Loop all the Aquabrowser results
            } else {

                numRecords = parseInt(results.root.feedbacks.standard.resultcount, 10);

                var records = results['root']['results']['record'];
                var recordsCreated = 0;

                /*!
                 * Function that creates a resource model
                 *
                 * @param  {Number}     recordsToCreate     Object containing resource data
                 * @param  {Object}     record              Object containing resource data
                 * @api private
                 */
                var _doCreateResourceModel = function(recordsToCreate, record) {

                    // Create the resource model
                    _createResourceModel(isDetailRequest, record, function(error, resource) {
                        if (error) {
                            log().error(error);
                            return callback({'code': 500, 'msg': 'An error occurred while fetching Aquabrowser data'});
                        }

                        // Add the model to the results collection
                        aquabrowserResults.push(resource);
                        recordsCreated++;

                        // If all the records have been created
                        try {
                            if (recordsCreated === recordsToCreate) {

                                // Fetch all the facets from the results
                                _getFacets(results.root.refine.d, parameters, function(error, facetsCollection) {
                                    if (error) {
                                        log().error(error);
                                        return callback({'code': 500, 'msg': 'An error occurred while fetching Aquabrowser data'});
                                    }

                                    // Fetch the facets
                                    facets = facetsCollection;

                                    // Create a list of applied filters
                                    filters = AquabrowserUtil.generateAppliedFilterCollection(results.root.feedbacks, parameters);

                                    // Compose the entire results object
                                    _createGlobalInformation();
                                });
                            }

                        } catch(error) {
                            log().error(error);
                            return callback({'code': 500, 'msg': 'An error occurred while fetching Aquabrowser data'});
                        }
                    });
                };

                // If a resource detail is requested
                if (isDetailRequest) {

                    // If the item occurs in multiple databases, it is returned as an array with multiple instances of itself.
                    // We select the first item since this is the most relevant one.
                    if (_.isArray(records)) {
                        records = records[0];
                    }

                    // Create a model for the resource
                    _doCreateResourceModel(1, records);

                // If a global search was performed
                } else {

                    // Check if the records are returned as an array
                    if (_.isArray(records)) {

                        // Store the number of records that need a model
                        var recordsToCreate = records.length;

                        // Loop all the resource records
                        _.each(records, function(record, index) {

                            // Create a model for the resource
                            _doCreateResourceModel(recordsToCreate, record);
                        });

                    } else {
                        _doCreateResourceModel(1, records);
                    }
                }
            }

        } catch(error) {
            log().error(error);
            return callback({'code': 500, 'msg': 'An error occurred while fetching Aquabrowser data'});
        }
    });
};

/**
 * Function that fetches the results from the Summon API using a raw query
 *
 * @param  {String}     queryString     A raw querystring
 * @param  {Function}   callback        Standard callback function
 */
var getResultsByRawQuery = exports.getResultsByRawQuery = function(queryString, callback) {

    // Execute the query
    _executeQuery(queryString, function(err, results) {
        if (err) {
            log().error({'code': err.code, 'msg': err.msg}, 'Error while executing Aquabrowser query');
            return callback(err);
        }

        // Return the results
        return callback(null, results);
    });
};

//////////////////////////
//  INTERNAL FUNCTIONS  //
//////////////////////////

/**
 * Function that executes an Aquabrowser query and fetches the results from the API
 *
 * @param  {String}     queryString         The queryString that needs to be appended to the API uri
 * @param  {Function}   callback            Standard callback function
 * @param  {Error}      callback.error      Error object to be sent with the callback function
 * @param  {Object}     callback.results    Object containing the results returned from the Aquabrowser API
 * @api private
 */
var _executeQuery = function(queryString, callback) {

    // Request options object
    var options = {
        'url': config.constants.engines.aquabrowser.uri + '?' + queryString,
        'timeout': config.constants.engines.aquabrowser.timeout
    };

    // Perform the request to the Aquabrowser API
    request(options, function(err, results, body) {
        if (err) {
            log().error({'code': 400, 'msg': err}, 'An error occurred while requesting Aquabrowser data');
            return callback({'code': 400, 'msg': 'An error occurred while requesting Aquabrowser data'});
        }

        // Remove all the whitespaces and tags from the XML
        var xml = results.body.trim();

        // Parse the XML
        return _parseXML(xml, callback);
    });
};

/**
 * Function that parses the XML data from the API into a JSON format
 *
 * @param  {XML}        data                The XML data that needs to be parsed
 * @param  {Function}   callback            Standard callback function
 * @param  {Error}      callback.error      Error object to be sent with the callback function
 * @param  {Object}     callback.results    Object containing the parsed XML data
 * @api private
 */
var _parseXML = function(xml, callback) {

    // Create an options object for the JSON parsing
    var parseOpts = {
        'explicitArray': false,
        'explicitChildren': true,
        'mergeAttrs': true,
        'trim': true
    };

    // Parse the XML as a JSON string
    xml2js.parseString(xml, parseOpts, function(err, results) {
        if (err || !results.root) {
            if (err) {
                log().error(err);
            }
            return callback({'code': 500, 'msg': 'An error occurred while parsing the Aquabrowser XML data'});
        }

        // Return the results
        return callback(null, results);
    });
};

/**
 * Function that creates an availability model
 *
 * @param  {Object}     availability    The availability information for a specific branch
 * @return {Branch}                     The returned branch
 * @api private
 */
var _createAvailabilityModel = function(availability) {
    var location = availability.location;
    var sublocation = availability.sublocation;
    var status = availability.status;
    var itemCount = availability.itemcount;
    var externalDatasourceName = availability.externalDatasourceName || null;
    var nativeId = availability.nativeId || null;
    var placeHoldUrl = availability.placeHoldUrl || null;
    var notes = availability.notes || null;
    var branch = new ResultsModel.Branch(location, sublocation, status, itemCount, externalDatasourceName, nativeId, placeHoldUrl, notes);
    return branch;
};

/**
 * Function that creates a resource model
 *
 * @param  {Boolean}   isDetailRequest    Indicates if function is called during a detail request (true|false)
 * @param  {Object}    record             The resource record
 * @param  {Function}  callback           The callback function
 * @param  {Error}     callback.error     Error object to be send with the callback function
 * @param  {Result}    callback.result    The created resource model
 * @api private
 */
var _createResourceModel = function(isDetailRequest, record, callback) {

    try {

        // Create an object to store our model data
        var modelData = {
            'id': AquabrowserUtil.getResourceID(record),
            'src': AquabrowserUtil.getResourceSource(record),
            'extId': AquabrowserUtil.getResourceExtID(record),
            'titles': AquabrowserUtil.getResourceTitles(record),
            'description': AquabrowserUtil.getResourceDescription(record),
            'isbn': AquabrowserUtil.getResourceISBN(record),
            'eisbn': null,
            'issn': null,
            'ssid': null,
            'authors': AquabrowserUtil.getResourceAuthors(record),
            'published': AquabrowserUtil.getResourcePublicationData(record),
            'subjects': AquabrowserUtil.getResourceSubjects(record),
            'series': AquabrowserUtil.getResourceSeries(record),
            'tags': AquabrowserUtil.getResourceTags(record),
            'notes': AquabrowserUtil.getResourceNotes(record),
            'contentType': AquabrowserUtil.getResourceContentType(record),
            'eResource': AquabrowserUtil.getEResource(record),
            'links': AquabrowserUtil.getResourceLinks(record),
            'availability': AquabrowserUtil.getResourceBranches(record)
        };

        if (!modelData.id) {
            return callback({'code': 500, 'msg': 'Invalid or no resource ID returned from server'});
        }

        // Fetch the availability information for the resource before returning the results (async request)
        if (isDetailRequest) {
            _getItemAvailability(modelData.extId, function(error, results) {
                if (error) {
                    log().error(error);
                    return callback(error);
                }
                modelData.availability = results;
                return callback(null, ResourceModelFactory.createResourceModel(modelData));
            });

        } else {
            return callback(null, ResourceModelFactory.createResourceModel(modelData));
        }

    } catch (err) {
        log().error(err);
        return callback({'code': 500, 'msg': 'An error occurred while fetching Aquabrowser data'});
    }
};

/**
 * Function that returns all the facets
 *
 * @param  {Object}    results             Object containing the facet data
 * @param  {Function}  callback            The callback function
 * @param  {Error}     callback.error      The thrown error
 * @param  {Results}   callback.results    The created facets model
 * @api private
 */
var _getFacets = function(results, parameters, callback) {
    try {

        // Initialize facets collection
        var facetsCollection = [];

        // Loop the facets
        _.each(results, function(facetType) {

            if (_.isObject(facetType)) {

                // Pick all the necessary properties from the facetType
                var facetTypeLabel = facetType.lbl;
                var facetTypeRawLabel = facetType.rawlbl;
                var facetTypeAmount = facetType.t;
                var more = facetType.more;
                var moreUrl = searchUtil.createFacetMoreUrl(parameters, facetTypeRawLabel);

                if (facetType.kw) {
                    if (!_.isArray(facetType.kw)) {
                        facetType.kw = [facetType.kw];
                    }

                    // Create a new Facet model for each facet
                    var facets = [];
                    _.each(facetType.kw, function(facet) {

                        // Pick all the necessary properties from the facet
                        var facetLabel = facet.lbl;
                        var facetAmount = parseInt(facet.c, 10);
                        var refValue = facet.i;
                        if (parameters.ref) {
                            refValue = util.format('%s;%s', parameters.ref, facet.i);
                        }
                        var facetUrl = searchUtil.createFacetUrl(parameters, 'ref', refValue);

                        // Create a new facet model
                        var facetModel = new FacetModel.Facet(facetLabel, facetAmount, facetUrl, facet.i);
                        facets.push(facetModel);
                    });

                    // Create a new FacetType model
                    var facetTypeModel = new FacetModel.FacetType(facetTypeLabel, facetTypeRawLabel, facetTypeAmount, more, moreUrl, facets);
                    facetsCollection.push(facetTypeModel);
                }
            }
        });

        // Return as a null object if the collection doesn't contain results
        if (facetsCollection && !facetsCollection.length) facetsCollection = null;
        return callback(null, facetsCollection);

    } catch (err) {
        return callback(err);
    }
};

/**
 * Function that fetches the resource availibility
 *
 * @param  {String}    extID                The external ID of the resource item (e.g. |cambrdgedb|2099538)
 * @param  {Function}  callback             The callback function
 * @param  {Error}     callback.error       Error object to be send with the callback function
 * @param  {Array}     callback.branches    Collection of results to be send with the callback function
 * @api private
 */
var _getItemAvailability = function(extID, callback) {
    try {

        // Create a new collection for the branches that store the resource
        var branches = [];

        // Request options object
        var options = {
            'url': config.constants.engines.aquabrowser.uri_availability + '?hreciid=' + extID + '&output=xml'
        };

        // Perform a request to the availability API
        request(options, function(error, response, body) {
            if (error) {
                log().error(error);
                return callback({'code': 500, 'msg': 'Error while fetching availability information'});
            }

            // Parse the received XML from the API
            try {

                // Create an options object for the JSON parsing
                var parseOpts = {
                    'explicitArray': false,
                    'mergeAttrs': true
                };

                xml2js.parseString(body, parseOpts, function(error, results) {
                    _.each(results.root, function(database) {

                        // If the availability information is returned as an array
                        if (_.isArray(database.availability)) {
                            _.each(database.availability, function(branch) {
                                branches.push(_createAvailabilityModel(branch));
                            });

                        // When the availability information contains only one object
                        } else {
                            branches.push(_createAvailabilityModel(database.availability));
                        }
                    });
                });

                // Return a collection of branches where the items are available
                var totalBranches = branches.length;
                if (branches && !branches.length) branches = null;
                var branchesModel = new ResultModel.Branches(totalBranches, branches);
                return callback(null, branchesModel);

            } catch(error) {
                log().error(error);
                return callback({'code': 500, 'msg': 'Error while fetching availability information'});
            }
        });

    } catch (err) {
        log().error(err);
        return callback({'code': 500, 'msg': 'Error while fetching availability information'});
    }
};

/**
 * Function that creates the pagination for the returned Aquabrowser results
 *
 * @param  {Object}       results                 The response from the Aquabrowser API
 * @param  {Object}       parameters              Query parameters
 * @param  {Function}     callback                The callback function
 * @param  {Error}        callback.error          Error object to be send with the callback function
 * @param  {Result}       callback.pagination     Collection containing all the facets
 */
var _getPagination = function(results, parameters, callback) {
    try {

        // Initialize some variables
        var page = null;
        var pager = null;
        var pageNumber = 0;
        var pageCount = 0;
        var firstPage = 0;
        var lastPage = 0;

        // Since we don't want to have changes in our original query object, we need to clone the parameters
        var params = _.clone(parameters);
        params.api = 'aquabrowser';

        // If pager information is available
        if (results.root.feedbacks.pager) {

            // Store the pagination information
            pager = results.root.feedbacks.pager;

            pageNumber = parseInt(pager.currentpage, 10);

            // We only support the first 50 pages of the results
            pageCount = parseInt(pager.totalpages, 10);
            if (pageCount > config.nodes['find-a-resource'].settings.pageLimit) pageCount = config.nodes['find-a-resource'].settings.pageLimit;

            firstPage = 1;

            lastPage = parseInt(pager.totalpages, 10);
            if (lastPage > config.nodes['find-a-resource'].settings.pageLimit) lastPage = config.nodes['find-a-resource'].settings.pageLimit;

        // If no pager information is available, but standard feedback is provided
        } else if (results.root.feedbacks.standard) {

            // Store the pagination information
            pager = results.root.feedbacks.standard;

            pageNumber = parseInt(pager.currentpage, 10);
            pageCount = firstPage = lastPage = 1;
        }

        var pagination = searchUtil.createPaginationModel(params, pageNumber, pageCount, firstPage, lastPage);
        return callback(null, pagination);

    } catch(error) {
        log().error(error);
        return callback({'code': 500, 'msg': 'An error occurred while fetching Aquabrowser data'});
    }
};

/**
 * Function that creates a suggestions model for the search results
 *
 * @param  {Object}       parameters              The query parameters
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
    request({'url': url}, function(error, results, body) {
        if (error) {
            log().error(error);
            return callback({'code': 500, 'msg': 'An error occurred while fetching Aquabrowser data'});
        }

        // Create an options object for the JSON parsing
        var parseOpts = {
            'trim': true,
            'mergeAttrs': true
        };

        try {
            // Parse the returned XML
            xml2js.parseString(body, parseOpts, function(error, results) {
                if (error || !results.cloud) {
                    if (error) log().error(error);
                    return callback({'code': 500, 'msg': 'An error occurred while fetching Aquabrowser data'});
                }

                // Fetch the original entered query
                if (results.cloud.concept) {
                    originalQuery = results.cloud.concept[0];
                }

                // Fetch the suggestions
                _.each(results.cloud.i, function(row) {
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

        } catch(error) {
            log().error(error);
            return callback({'code': 500, 'msg': 'An error occurred while fetching Aquabrowser data'});
        }
    });
};
