var _ = require('underscore');
var assert = require('assert');
var request = require('request');

var config = require('../../../../config');

var summon = require('../../../../lib/controllers/api/search/summon/api');

describe('Summon API', function() {

    var validID = 'FETCH-crossref_primary_10_1093_sysbio_syq0930';
    var validString = 'Darwin';
    var invalidString = 'asdfsdfasdfsdfs"£/////"""D@£@£T@£$T@£@£';

    /**
     * Test that verifies that resources are returned correctly while doing a global search
     */
    it('verify that fetching resources succeeds while doing a global search.', function(callback) {

        // Request options object
        var options = {
            'url': config.server.protocol + '://' + config.server.host + ':' + config.server.port + '/api/search/summon?q=' + validString
        };

        // Perform a request to the Summon API
        request(options, function(error, response, body) {
            assert.ok(!error);
            body = JSON.parse(body);
            assert.ok(_.isObject(body));
            assert.ok(_.isObject(body.results));
            assert.ok(_.isObject(body.results.summon));
            assert.ok(_.isNumber(body.results.summon.rowCount));
            assert.ok(_.isArray(body.results.summon.facets));
            assert.ok(_.isArray(body.results.summon.facetsOverview));
            assert.ok(_.isArray(body.results.summon.items));
            assert(body.results.summon.pagination);
            assert.ok(_.isObject(body.query));
            assert.equal(body.query.q, validString);
            callback();
        });
    });

    /**
     * Test that verifies that suggestions are returned correctly when no results are found
     */
    it('verify that suggestions are returned correctly when no results are found.', function(callback) {

        // Request options object
        var options = {
            'url': config.server.protocol + '://' + config.server.host + ':' + config.server.port + '/api/search/summon?q=' + invalidString
        };

        // Perform a request to the Summon API
        request(options, function(error, response, body) {
            assert.ok(!error);
            body = JSON.parse(body);
            assert.ok(_.isObject(body));
            assert.ok(_.isObject(body.results));
            assert.ok(_.isObject(body.results.summon));
            assert.ok(_.isNumber(body.results.summon.rowCount));
            assert.equal(body.results.summon.rowCount, 0);
            assert.ok(_.isArray(body.results.summon.facets));
            assert.ok(_.isArray(body.results.summon.facetsOverview));
            assert.ok(_.isArray(body.results.summon.items));
            assert(body.results.summon.pagination);
            assert(body.results.summon.suggestions);
            assert.ok(_.isObject(body.query));
            assert.equal(body.query.q, invalidString);
            callback();
        });
    });

    /**
     * Test that verifies that a resource is returned correctly when an ID has been specified
     */
    it('verify that fetching a resource by its ID is returned correctly.', function(callback) {

        // Request options object
        var options = {
            'url': config.server.protocol + '://' + config.server.host + ':' + config.server.port + '/api/search/summon?id=' + validID
        };

        // Perform a request to the Aquabrowser API
        request(options, function(error, response, body) {
            assert.ok(!error);
            body = JSON.parse(body);
            assert.ok(_.isObject(body));
            assert.ok(_.isObject(body.results));
            assert.ok(_.isObject(body.results.summon));
            assert.ok(_.isNumber(body.results.summon.rowCount));
            assert.equal(body.results.summon.rowCount, 1);
            assert.ok(_.isArray(body.results.summon.facets));
            assert.ok(_.isArray(body.results.summon.facetsOverview));
            assert.ok(_.isArray(body.results.summon.items));
            assert.equal(body.results.summon.items[0].id[0], validID);
            assert(body.results.summon.pagination);
            assert.ok(_.isObject(body.query));
            assert.equal(body.query.id, validID);
            callback();
        });
    });

    /**
     * Test that verifies that empty result model is returned when an invalid ID has been specified
     */
    it('verify that fetching a resource by an invalid ID returns an empty result model.', function(callback) {

        // Request options object
        var options = {
            'url': config.server.protocol + '://' + config.server.host + ':' + config.server.port + '/api/search/summon?id=' + invalidString
        };

        // Perform a request to the Aquabrowser API
        request(options, function(error, response, body) {
            assert.ok(!error);
            body = JSON.parse(body);
            assert.ok(_.isObject(body));
            assert.ok(_.isObject(body.results));
            assert.ok(_.isObject(body.results.summon));
            assert.ok(_.isNumber(body.results.summon.rowCount));
            assert.equal(body.results.summon.rowCount, 0);
            assert.ok(_.isArray(body.results.summon.facets));
            assert.ok(_.isArray(body.results.summon.facetsOverview));
            assert.ok(_.isArray(body.results.summon.items));
            assert(body.results.summon.pagination);
            assert.ok(_.isObject(body.query));
            assert.equal(body.query.id, invalidString);
            callback();
        });
    });
});
