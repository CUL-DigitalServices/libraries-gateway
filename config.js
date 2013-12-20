var bunyan = require('bunyan');

var config = module.exports = require('./config_private');

config.server = {
    'port': 5000
};

config.app = {
    'title': 'Cambridge Libraries',
    'hostname': 'libraries-gateway.cam.ac.uk'
};

config.log = {
    'streams': [
        {
            'level': 'info',
            'path': 'server.log'
        }
    ],
    'serializers': {
        'err': bunyan.stdSerializers.err,
        'req': bunyan.stdSerializers.req,
        'res': bunyan.stdSerializers.res
    }
};

// Constants
config.constants = {

    // Search API's
    'engines': {
        'aquabrowser': {
            'timeout': 5000,
            'uri': 'http://search.lib.cam.ac.uk/result.ashx',
            'uri_availability': 'http://search.lib.cam.ac.uk/availability.ashx',
            'uri_suggestions': 'http://search.lib.cam.ac.uk/AquaServer.ashx'
        },
        'summon': {
            'timeout': 10000,
            'uri': 'api.summon.serialssolutions.com',
            'version': '/2.0.0/search'
        }
    },

    // Available formats (search)
    'formats': {

        // Formats that are displayed in the search dropdown
        'Book': {
            'displayInSearch': true,
            'displayName': 'Books',
            'aquabrowser': 'Book',
            'summon': 'Book'
        },
        'EBook': {
            'displayInSearch': true,
            'displayName': 'EBooks',
            'aquabrowser': 'EBook',
            'summon': 'eBook'
        },
        'Ejournal': {
            'displayInSearch': true,
            'displayName': 'Ejournals',
            'aquabrowser': 'Ejournal',
            'summon': 'Ejournal'
        },
        'Manuscript': {
            'displayInSearch': true,
            'aquabrowser': 'Manuscript',
            'summon': 'Manuscript'
        },
        'Journal': {
            'displayInSearch': true,
            'aquabrowser': 'Journal',
            'summon': 'Journal Article'
        },
        'Paper': {
            'displayInSearch': true,
            'aquabrowser': 'Paper',
            'summon': 'Paper'
        }

        // Formats that are not displayed in the search dropdown
    },

    // Twitter cache
    'refresh': {
        'twitter': {
            'tweet_expiration': 900000
        }
    },

    // Search settings
    'search': {
        'pageLimit': 40,
        'parameters': ['api', 'author', 'format', 'id', 'language', 'page', 'mdtags', 'person', 'q', 'region', 'series', 'subject', 'timeperiod', 'uniformtitle']
    }
};

// Nodes
config.nodes = {
    'home': {
        'title': 'Home',
        'link': ''
    },
    'find-a-resource': {
        'title': 'Find a resource',
        'link': 'find-a-resource'
    },
    'find-a-library': {
        'title': 'Find a library',
        'link': 'find-a-library'
    },
    'using-our-libraries': {
        'title': 'Using our libraries',
        'link': 'using-our-libraries'
    },
    'my-account': {
        'title': 'My account',
        'link': 'my-account'
    }
};
