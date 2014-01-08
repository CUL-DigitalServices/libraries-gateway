var assert = require('assert');

var server = require('../lib/util/server');

describe('Server', function() {

    /**
     * Test that verifies if a new webserver can be spun up correctly
     */
    it('verify if a new server can be spun up.', function(callback) {

        // Create a new Express webserver
        server.createServer(function(err) {
            assert.ok(!err);
            callback();
        });
    });
});
