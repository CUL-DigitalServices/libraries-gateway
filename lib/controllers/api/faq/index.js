var _ = require('underscore');

var faqDAO = require('../../../dao/faq');

/**
 * Function that returns the FAQ records
 *
 * @param  {Request}   req    Request object
 * @param  {Response}  res    Response object
 */
var getFaqs = exports.getFaqs = function(req, res) {

	// Fetch all the faq's from the database
    faqDAO.getFaqs(function(err, faqs) {
        if (err) {
            return res.send(500, {'error': err});
        }

        // Return the results
        return res.send(200, faqs);
    });
};
