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
var fs = require('fs');
var q = require('q');
var util = require('util');

var AquabrowserTestsUtil = require('./tests.aquabrowser');
var config = require('../../config');
var log = require('../../lib/util/logger').logger();
var SearchAPI = require('../../lib/controllers/api/search/index');
var ServerUtil = require('../../lib/util/server');
var SummonTestsUtil = require('./tests.summon');

var requestUtils = null;
var results = [];
var server = null;

/**
 * Function that executes the tests after the test data has been parsed (e.g. search for 'Darwin', 'Survival of the fittest'... in all the specified API's)
 *
 * @param  {Object[]}   tests       Object containing the test data
 * @api private
 */
var runTests = function(tests) {

    // Run the tests as long as tests are available
    if (!tests.length) {
        return stopTests();
    }

    // Object that will be populated with the API results for a single query
    var testResult = {
        'title': '',
        'results': {}
    };

    // Run the first test from the collection
    runTest(tests.shift(), testResult, function(err, testResult) {
        if (err) {
            log().err({'code': err.code, 'msg': err.msg}, 'Error while executing test');
        }

        // Save the testresults
        results.push(testResult);

        // Execute the next test
        return runTests(tests);
    });
};

/**
 * Function that executes a specific test for multiple API's (e.g. search for 'Darwin' in all the specified API's)
 *
 * @param  {Object}     test                    Object containing test data
 * @param  {Object}     testResult              Object that stores the test result data
 * @param  {Function}   callback                Standard callback function
 * @param  {Error}      callback.err            Object containing the error code and error message
 * @param  {Object}     callback.testResult     Object containing test result data
 * @api private
 */
var runTest = function(test, testResult, callback) {

    // Set the test's title
    testResult.title = test.title;

    try {

        // Create a test object
        test = _.map(test.api, function(query, api) { return {'api': api, 'query': query}; });

        // Cache the number of API's that are specified
        var numTests = test.length;

    } catch(err) {
        log().error({'code': 500, 'msg': err}, 'Error while creating a test object');
        return callback({'code': 500, 'msg': err});
    }

    /*!
     * Loop through the request for the API's
     *
     * @param  {Object[]}   test    Collection of tests for specific API's
     * @api private
     */
    var _doAPIRequests = function(test) {

        // Cache the results and invoke the callback function if all the request have been sent
        if (!test.length) {
            return callback(null, testResult);
        }

        // Calculate the current test number
        var currentTestNumber = numTests - test.length + 1;

        // Send a request to the first API of the list
        doAPIRequest(test.shift(), currentTestNumber, numTests, testResult.title, function(api, err, result) {

            // Add the error to the API specific result
            if (err) {
                log().error({'err': err}, 'Error while doing API request');
                testResult.results[api] = {'err': err};

            // Add the results to the results object
            } else {
                testResult.results[api] = result;
            }

            // Continue
            return _doAPIRequests(test);
        });
    };

    // Execute the request for every specified API
    _doAPIRequests(test);
};

/**
 * Function that sends a request to a specified API (e.g. search for 'Darwin' in Summon)
 *
 * @param  {Object}     test                Object containing test data
 * @param  {String}     test.api            The API that needs to be used to perform the request
 * @param  {String}     test.query          The query that needs to be send to perform the request
 * @param  {Number}     currentTestNumber   The number of the current test executed
 * @param  {Number}     numTests            The number of total API's used for this query
 * @param  {String}     title               The title of the current test
 * @param  {Function}   callback            Standard callback function
 * @param  {Error}      callback.err        Object containing the error code and the error message
 * @param  {Object}     callback.result     Object containing the results from the API
 * @api private
 */
var doAPIRequest = function(test, currentTestNumber, numTests, title, callback) {
    log().info(util.format('Running test (%s/%s) of \'%s\' for %s', currentTestNumber, numTests, title, test.api));

    // Determine which API should be used
    var apiUtil = requestUtils[test.api];

    // Return an error if an invalid API was specified
    if (!apiUtil) {
        return callback(test.api, {'code': 400, 'msg': 'Invalid API'});
    }

    // Get the util method
    var requestFunc = apiUtil.getTestResultData;

    // Return an error if the API util doesn't have the needed method
    if (!requestFunc) {
        return callback(test.api, {'code': 400, 'msg': 'Invalid API method'});
    }

    // Invoke the API specific method
    requestFunc(test.query, function(err, result) {
        if (err) {
            return callback(test.api, err);
        }

        // Return the result from the API
        return callback(test.api, null, result);
    });
};

/**
 * Function that kills the server after the tests have been completed
 *
 * @api private
 */
var stopTests = function() {
    log().info('Finished executing the tests');

    // Output the test results
    writeTestsFile(function() {

        // Close the server
        return server.close();
    });
};

/**
 * Function that writes the results to an external file
 *
 * @param  {Function}   callback    Standard callback function
 * @api private
 */
var writeTestsFile = function(callback) {

    console.log(JSON.stringify(results, null, 4));

    // Invoke the callback function
    return callback();
};

/**
 * Function that reads and parses the test file before running the tests
 *
 * @api private
 */
var readTestsFile = function() {
    log().info('Reading the tests file...');

    // Read the tests file
    fs.readFile('./data/tests.json', 'utf8', function(err, data) {
        if (err) {
            return log().error({'err': err}, 'Error while reading tests file');
        }

        try {

            // Parse the JSON data
            data = JSON.parse(data);

        } catch(err) {
            log().error({'err': err}, 'Error while parsing test data');
            return stopTests({'code': 500, 'msg': err});
        }

        // Run the tests
        return runTests(data.tests);
    });
};

/**
 * Function that registers a function for every API
 *
 * @api private
 */
var registerRequestUtils = function() {

    // Object that maps every API to its own method
    requestUtils = {
        'aquabrowser': AquabrowserTestsUtil,
        'summon': SummonTestsUtil
    };
};

/**
 * Function that initializes the server by calling the 'createServer' method in the server util
 *
 * @api private
 */
var init = function() {

    /**
     * Create a new Express server
     */
    ServerUtil.createServer(6000, function(err, _server) {
        if (err) {
            return log().error({'code': err.code, 'msg': err.msg}, 'Error while spinning up Express server');
        }

        // Cache the created server
        server = _server;

        // Register the request functions
        registerRequestUtils();

        // Read the file that contains the test data
        return readTestsFile();
    });
};

init();
