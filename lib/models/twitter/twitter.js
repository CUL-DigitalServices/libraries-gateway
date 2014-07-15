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

/**
 * A tweet model
 *
 * @param  {String}  name           The name of the user (e.g. Earth Sci Library)
 * @param  {String}  screen_name    The screen name of the user (e.g. EarthSciCam)
 * @param  {String}  created_at     The date of the tweet (e.g. 4/12/2013)
 * @param  {String}  text           The tweet message
 * @return {Tweet}                  The returned coords object
 */
exports.Tweet = function(name, screen_name, created_at, text) {
    var that = {};
    that.name = name;
    that.screen_name = screen_name;
    that.created_at = created_at;
    that.text = text;
    return that;
};
