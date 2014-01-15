var pagination = require('pagination');

/**
 * Constructor
 */
var PaginationController = module.exports.PaginationController = function() {
    var that = this;

    /**
     * Function that renders the pagination template
     *
     * @param  {Request}   req                        The request object
     * @param  {Response}  res                        The response object
     * @param  {Object}    parameters                 The parameters object
     * @param  {Number}    parameters.currentPage     The current page
     * @param  {Number}    parameters.itemsPerPage    The items per page
     * @param  {Number}    parameters.totalItems      The total items
     * @param  {Function}  callback                   Standard callback function
     * @param  {Error}     callback.error             The thrown error
     * @param  {String}    callback.template          The HTML dump of the pagination template
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
