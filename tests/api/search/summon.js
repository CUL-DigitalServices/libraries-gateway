var _ = require('underscore');
var assert = require('assert');

var summon = require('../../../lib/controllers/api/search/summon');

describe('Summon API', function() {

    /**
     * Test that verifies that resources are returned correctly while doing a global search
     */
    it('verify that fetching resources succeeds while doing a global search.', function(callback) {

        // Create a request parameters object
        var params = {
            'q': 'Darwin'
        };

        // Get the Summon results
        summon.getResults(true, params, function(err, results) {
            assert.ok(!err);
            assert.ok(_.isObject(results));
            assert.ok(_.isNumber(results.rowCount));
            assert.ok(_.isArray(results.facets));
            assert.ok(_.isArray(results.facetsOverview));
            assert.ok(_.isArray(results.items));
            assert.ok(_.isObject(results.pagination));
            assert.ok(_.isObject(results.suggestions));
            callback();
        });
    });

    /**
     * Test that verifies that a resource is returned correctly when an ID has been specified
     */
    it('verify that fetching a resource by its ID is returned correctly.', function(callback) {

        // Create a request parameters object
        var params = {
            'id': 'FETCH-crossref_primary_10_1093_sysbio_syq0930'
        };

        // Get the Summon results
        summon.getResults(true, params, function(err, result) {
            assert.ok(!err);
            assert.ok(_.isObject(result));
            assert.ok(_.isNumber(result.rowCount));
            assert.ok(_.isArray(result.facets));
            assert.ok(_.isArray(result.facetsOverview));
            assert.ok(_.isArray(result.items));
            assert.ok(_.isObject(result.pagination));
            assert.ok(_.isObject(result.suggestions));

            // Check if the specified ID matches the resource's ID
            assert.equal(result.items[0].id[0], params.id);

            callback();
        });
    });

    /**
     * Test that verifies that empty result model is returned when an invalid ID has been specified
     */
    it('verify that fetching a resource by an invalid ID returns an empty result model.', function(callback) {

        // Create a request parameters object
        var params = {
            'id': 'asdfsdfasdfsdfs"£/////"""D@£@£T@£$T@£@£afasdfsadfsdfasdfdsfdss'
        };

        // Get the Summon results
        summon.getResults(true, params, function(err, result) {
            assert.ok(!err);
            assert.ok(_.isObject(result));
            assert.ok(_.isNumber(result.rowCount));
            assert.equal(result.rowCount, 0);
            assert.ok(_.isArray(result.facets));
            assert.ok(_.isArray(result.facetsOverview));
            assert.ok(_.isArray(result.items));
            assert.ok(_.isObject(result.pagination));
            assert.ok(_.isObject(result.suggestions));
            callback();
        });
    });

    /**
     * Test that verifies that suggestions are returned correctly when no results are found
     */
    it('verify that suggestions are returned correctly when no results are found.', function(callback) {

        // Create a request parameters object
        var params = {
            'q': 'asdfsdfasdfsdfs"£/////"""D@£@£T@£$T@£@£afasdfsadfsdfasdfdsfdss'
        };

        // Get the Summon results
        summon.getResults(true, params, function(err, result) {
            assert.ok(!err);
            assert.ok(_.isObject(result));
            assert.ok(_.isNumber(result.rowCount));
            assert.equal(result.rowCount, 0);
            assert.ok(_.isArray(result.facets));
            assert.ok(_.isArray(result.facetsOverview));
            assert.ok(_.isArray(result.items));
            assert.ok(_.isObject(result.pagination));
            assert.ok(_.isObject(result.suggestions));
            callback();
        });
    });
});