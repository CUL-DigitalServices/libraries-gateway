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

var config = require('../../../config');
var log = require('lg-util/lib/logger').logger();

var SummonTest = require('../search/tests.summon.js');

/**
 * Function that returns the content for the test
 *
 * @param  {Request}    req     The Express request object
 * @param  {Response}   res     The EXpress response object
 */
var getContent = module.exports.getContent = function(req, res) {
    return res.status(200).sendFile(config.app.root + '/tests/static/widgets/index.html');
};

/**
 * Function that returns the Summon results
 *
 * @param  {Request}    req     The Express request object
 * @param  {Response}   res     The EXpress response object
 */
var getResults = module.exports.getResults = function(req, res) {

    // Return an error if an invalid queryString was specified
    if (!req.query) {
        return res.status(400).send('Invalid or malformed queryString');
    }

    // Variable that stores the queryString keys
    var queryString = [];

    // Construct the request queryString
    _.each(req.query, function(values, key) {
        if (values) {
            if (_.isArray(values)) {
                _.each(values, function(value) {
                    if (value) queryString.push(key + '=' + value);
                });
            } else {
                if (values) queryString.push(key + '=' + values);
            }
        }
    });

    // Order the keys alphabetically before converting to a string
    queryString = queryString.sort().join('&');

    // Send a request to the Summon API (promise)
    SummonTest.getTestResultData(queryString)

        // Return the results
        .then(function(results) {
            return res.status(200).send({'results': results});
        })

        // Return an error, if any
        .catch(function(err) {
            return res.status(err.code).send(err.msg);
        });
};
