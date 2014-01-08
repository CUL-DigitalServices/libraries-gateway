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
            assert.ok(_.isNumber(results.rowCount));
            assert.ok(_.isArray(results.facets));
            assert.ok(_.isArray(results.facetsOverview));
            assert.ok(_.isArray(results.items));
            assert.ok(_.isObject(results.items));
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
            assert.ok(_.isNumber(result.rowCount));
            assert.ok(_.isArray(result.facets));
            assert.ok(_.isArray(result.facetsOverview));
            assert.ok(_.isArray(result.items));
            assert.ok(_.isObject(result.items));

            // Check if the specified ID matches the resource's ID
            assert.equal(result.items[0].id[0], params.id);

            callback();
        });
    });
});
