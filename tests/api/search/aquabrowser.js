var _ = require('underscore');
var assert = require('assert');

var aquabrowser = require('../../../lib/controllers/api/search/aquabrowser');

describe('Aquabrowser API', function() {

    /**
     * Test that verifies that resources are returned correctly while doing a global search
     */
    it('verify that fetching resources succeeds while doing a global search.', function(callback) {

        // Create a request parameters object
        var params = {
            'q': 'Darwin'
        };

        // Get the Aquabrowser results
        aquabrowser.getResults(true, params, function(err, results) {
            assert.ok(!err);
            assert.ok(_.isObject(results));
            callback();
        });
    });

    /**
     * Test that verifies that a resource is returned correctly when an ID has been specified
     */
    it('verify that fetching a resource by ID is returned correctly.', function(callback) {

        // Create a request parameters object
        var params = {
            'id': '12098311'
        };

        // Get the Aquabrowser results
        aquabrowser.getResults(true, params, function(err, result) {
            assert.ok(!err);
            assert.ok(_.isObject(result));
            callback();
        });
    });
});
