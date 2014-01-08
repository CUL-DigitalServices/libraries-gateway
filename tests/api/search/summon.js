var _ = require('underscore');
var assert = require('assert');

var summon = require('../../../lib/controllers/api/search/summon');

describe('Summon API', function() {

    /**
     * Test that verifies that resources from the Summon API are returned correctly while doing a global search
     */
    it('verify that fetching resources from the Summon API succeeds while doing a global search.', function(callback) {

        // Create a request parameters object
        var params = {
            'q': 'Darwin'
        };

        // Get the Summon results
        summon.getResults(true, params, function(err, results) {
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
            'id': 'FETCH-crossref_primary_10_1093_sysbio_syq0930'
        };

        // Get the Summon results
        summon.getResults(true, params, function(err, result) {
            assert.ok(!err);
            assert.ok(_.isObject(result));
            callback();
        });
    });
});
