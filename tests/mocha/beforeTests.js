var assert = require('assert');

var config = require('../../config');

var server = require('../../lib/util/server');

describe('Server', function() {

    /**
     * Test that verifies if a new webserver can be spun up correctly
     */
    it('verify if a new server can be spun up.', function(callback) {

        // Create a new Express webserver
        server.createServer(function(err, server) {
            assert.ok(!err);
            assert.equal(server.address().port, config.server.port);
            callback();
        });
    });
});
