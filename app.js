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

var util = require('util');

var config = require('./config');
var LG = require('lg-util');
var log = require('lg-util/lib/logger').logger();

// Initialize the application
LG.init()

    .then(function() {
        log().info(util.format('%s started at %s://%s:%s', config.app.title, config.server.protocol, config.server.host, config.server.port));
    })

    // Log the thrown error, if any
    .catch(function(err) {
        log().error(err);
    });
