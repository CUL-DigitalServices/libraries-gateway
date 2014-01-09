var _ = require('underscore');
var assert = require('assert');
var request = require('request');

var config = require('../../config');

var librariesDAO = require('../../lib/dao/libraries');

describe('Libraries API', function() {

    /**
     * Test that verifies that fetching all the library returns a collection of library objects
     */
    it('verify if fetching all libraries returns a collection of libraries.', function(callback) {

        // Request options object
        var options = {
            'url': 'http://localhost:' + config.server.port + '/api/libraries'
        };

        // Perform a request to the libraries API
        request(options, function(error, response, libraries) {
            assert.ok(!error);
            libraries = JSON.parse(libraries);
            assert.ok(_.isArray(libraries));
            _.each(libraries, function(library) {
                assert(library.id);
                assert(library.name);
                assert(library.url);
            })
            callback();
        });
    });

    /**
     * Test that verifies that fetching a library by it slug returns a library object
     */
    it('verify if fetching a specific library returns a library object.', function(callback) {

        // Request options object
        var options = {
            'url': 'http://localhost:' + config.server.port + '/api/libraries/african-studies'
        };

        // Perform a request to the libraries API
        request(options, function(error, response, library) {
            assert.ok(!error);
            library = JSON.parse(library);
            assert.ok(_.isObject(library));
            assert(library.id);
            assert(library.name);
            assert(library.url);
            callback();
        });
    });

    /**
     * Test that verifies that fetching a non-existing library by it slug returns a null object
     */
    it('verify that requesting a non-existing library returns a null object.', function(callback) {

        // Request options object
        var options = {
            'url': 'http://localhost:' + config.server.port + '/api/libraries/dskjfasl;fjs;lafjsd'
        };

        // Perform a request to the libraries API
        request(options, function(error, response, body) {
            assert.ok(!error);
            assert.equal(response.statusCode, 404);
            body = JSON.parse(body);
            assert.ok(body.error);
            assert.equal(body.error, 'Could not find library');
            callback();
        });
    });
});
