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
 * A blog post model
 *
 * @param  {String}     id          The entry's ID (e.g. tag:blogger.com,1999:blog-7721693964257975655.post-7365827974025738847)
 * @param  {String}     title       The entry's title (e.g. Vacation borrowing @ CSL)
 * @param  {String}     updated     The entry's update timestamp (e.g. 2009-11-16T12:54:30+00:00)
 * @param  {String}     link        The entry's external link (e.g. http://blogurl.com?p=1234)
 * @param  {String}     summary     The entry's summary (e.g. The Central Science Library is always keen...)
 * @return {BlogPost}               The returned blog post object
 */
exports.BlogPost = function(id, title, updated, link, summary) {
    var that = {};
    that.id = id;
    that.title = title;
    that.updated = updated;
    that.link = link;
    that.summary = summary;
    return that;
};
