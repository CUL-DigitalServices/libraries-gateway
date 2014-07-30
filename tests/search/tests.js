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

var PORT = 6000;
var SERVER = 'apitest';

/**
 * Function that executes the tests after the test data has been parsed (e.g. search for 'Darwin', 'Survival of the fittest'... in all the specified API's)
 *
 * @param  {Object[]}   tests       Object containing the test data
 * @api private
 */
var runTests = function(tests) {
    var deferred = q.defer();

    /*!
     * Function that executes the next test
     *
     * @param  {Object[]}   tests       Object containing the test data
     * @api private
     */
    var next = function(tests) {

        // Run the tests as long as tests are available
        if (!tests.length) {
            return deferred.resolve();
        }

        // Object that will be populated with the API results for a single query
        var testResult = {
            'title': '',
            'results': {}
        };

        // Run the first test from the collection
        runTest(tests.shift(), testResult, function(err, testResult) {
            if (err) {
                return defer.reject({'code': err.code, 'msg': err.msg});
            }

            // Save the testresults
            results.push(testResult);

            // Execute the next test
            next(tests);
        });
    };

    // Execute the first test
    next(tests);

    // Return a promise
    return deferred.promise;
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
     * Function that executes the next test
     *
     * @param  {Object[]}   test    Collection of tests for specific API's
     * @api private
     */
    var next = function(test) {

        // Cache the results and invoke the callback function if all the request have been sent
        if (!test.length) {
            return callback(null, testResult);
        }

        // Calculate the current test number
        var currentTestNumber = numTests - test.length + 1;

        // Send a request to the first API of the list
        doAPIRequest(test.shift(), currentTestNumber, numTests, testResult.title)

            // Add the API result to the global results
            .then(function(response) {
                testResult.results[response.api] = response.result;
            })

            // Catch the thrown error, if any
            .catch(function(response) {
                log().error({'err': response.err}, 'Error while doing API request');
                testResult.results[response.api] = {'err': response.err};
            })

            // Run the next test
            .done(function() {
                next(test);
            });
    };

    // Execute the first test
    next(test);
};

/**
 * Function that sends a request to a specified API (e.g. search for 'Darwin' in Summon)
 *
 * @param  {Object}     test                Object containing test data
 * @param  {String}     test.api            The API that needs to be used to perform the request
 * @param  {String}     test.query          The query string containing all the parameters to perform the request
 * @param  {Number}     currentTestNumber   The number of the current test executed
 * @param  {Number}     numTests            The number of total API's used for this query
 * @param  {String}     title               The title of the current test
 * @api private
 */
var doAPIRequest = function(test, currentTestNumber, numTests, title) {
    var deferred = q.defer();

    // Log the current test
    log().info(util.format('Running test (%s/%s) of \'%s\' for %s', currentTestNumber, numTests, title, test.api));

    // Determine which API should be used
    var apiUtil = requestUtils[test.api];

    // Return an error if an invalid API was specified
    if (!apiUtil) {
        return deferred.reject({'api': test.api, 'err': {'code': 400, 'msg': 'Invalid API'}});
    }

    // Get the util method
    var requestFunc = apiUtil.getTestResultData;

    // Return an error if the API util doesn't have the needed method
    if (!requestFunc) {
        return deferred.reject({'api': test.api, 'err': {'code': 400, 'msg': 'Invalid API method'}});
    }

    // Invoke the API specific method
    requestFunc(test.query)

        // Return the result from the API
        .then(function(result) {
            deferred.resolve({'api': test.api, 'result': result});
        })

        // Catch the thrown error, if any
        .catch(function(err) {
            deferred.reject({'api': test.api, 'err': err});
        });

    // Return a promise
    return deferred.promise;
};

/**
 * Function that kills the server after the tests have been completed
 *
 * @api private
 */
var stopTests = function() {
    log().info('Finished executing the tests');

    // Output the test results
    writeTestsFile().catch(errorHandler);
};

/**
 * Function that writes the results to an external file
 *
 * @param  {Function}   callback    Standard callback function
 * @api private
 */
var writeTestsFile = function(callback) {
    var deferred = q.defer();

    // TODO: write results to a file
    console.log(JSON.stringify(results, null, 2));

    // Resolve the promise
    deferred.resolve();

    // Return a promise
    return deferred.promise;
};

/**
 * Function that reads and parses the test file before running the tests
 *
 * @api private
 */
var readTestsFile = function() {
    var deferred = q.defer();

    // Read the tests file
    fs.readFile('./data/tests.json', 'utf8', function(err, data) {
        if (err) {
            deferred.reject({'err': err});
        }

        try {

            // Parse the JSON data
            data = JSON.parse(data);

            // Return the parsed data
            deferred.resolve(data.tests);

        } catch(err) {
            deferred.reject({'code': 500, 'msg': err});
        }
    });

    // Return a promise
    return deferred.promise;
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
 * Output the errors
 *
 * @param  {Error}      err         Object containing the error code and error message
 * @api private
 */
var errorHandler = function(err) {

    // Output the error
    log().error(err, err.msg);
};

/**
 * Initialize the tests
 *
 * @api private
 */
var init = function() {

    // Create a new Express server
    ServerUtil.createServer(SERVER, PORT)

        // Register the API utils
        .then(registerRequestUtils)

        // Read the test file (promise)
        .then(readTestsFile)

        // Run the tests (promise)
        .then(runTests)

        // Stop running the tests
        .then(stopTests)

        // Add an error handler
        .catch(errorHandler)

        // Close the server
        .done(function() {
            ServerUtil.closeServer(SERVER);
            log().info('Server closed');
        });
};

init();
