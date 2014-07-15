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

var pagination = require('pagination');

/**
 * Constructor
 */
var PaginationController = module.exports.PaginationController = function() {
    var that = this;

    /**
     * Function that renders the pagination template
     *
     * @param  {Request}    req                         The request object
     * @param  {Response}   res                         The response object
     * @param  {Object}     parameters                  The parameters object
     * @param  {Number}     parameters.currentPage      The current page
     * @param  {Number}     parameters.itemsPerPage     The items per page
     * @param  {Number}     parameters.totalItems       The total items
     * @param  {Function}   callback                    Standard callback function
     * @param  {Error}      callback.error              Object containing the error code and error message
     * @param  {String}     callback.template           The HTML dump of the pagination template
     */
    that.getPagination = function(req, res, parameters, callback) {

        // Create a pagination options object
        var paginationOptions = new pagination.SearchPaginator({
            'prelink': '/',
            'current': parameters.currentPage,
            'rowsPerPage': parameters.itemsPerPage,
            'totalResult': parameters.totalItems
        }).getPaginationData();

        // Render the pagination partial
        res.render('partials/globals/pagination', paginationOptions, function(error, template) {
            if (error) {
                return callback(error);
            }
            return callback(null, template);
        });
    };
};
