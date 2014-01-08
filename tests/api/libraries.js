var _ = require('underscore');
var assert = require('assert');

var librariesDAO = require('../../lib/dao/libraries');

describe('Libraries API', function() {

    /**
     * Test that verifies that fetching all the library returns a collection of library objects
     */
    it('verify if fetching all libraries returns a collection of libraries.', function(callback) {

        // Execute the getLibraries function in the libraries DAO
        librariesDAO.getLibraries(function(err, result) {
            assert.ok(!err);
            assert.ok(_.isArray(result, "libraries are not returned as an array"));
            _.each(result, function(library) {
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

        // Execute the getLibraryBySlug function in the libraries DAO
        librariesDAO.getLibraryBySlug('african-studies', function(err, result) {
            assert.ok(!err);
            assert(result.id);
            assert(result.name);
            assert(result.url);
            callback();
        });
    });

    /**
     * Test that verifies that fetching a non-existing library by it slug returns a null object
     */
    it('verify that requesting a non-existing library returns a null object.', function(callback) {

        // Execute the getLibraryBySlug function in the libraries DAO
        librariesDAO.getLibraryBySlug('sdfasdfsd', function(err, result) {
            assert.ok(!err);
            assert.equal(result, null);
            callback();
        });
    });
});
