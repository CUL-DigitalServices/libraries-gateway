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

    // The alphabet
    'alphabet': ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],

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
    }
};

// Nodes
config.nodes = {

    // Home
    'home': {
        'title': 'Home',
        'link': '',
        'inNavigation': true,
        'settings': {
            'twitter': {
                'tweet_expiration': 900000
            }
        }
    },

    // Find a resource
    'find-a-resource': {
        'title': 'Find a resource',
        'link': 'find-a-resource',
        'inNavigation': true,
        'settings': {
            'pageLimit': 40,
            'parameters': ['api', 'author', 'contenttype', 'format', 'id', 'language', 'page', 'mdtags', 'person', 'q',
                'region', 'series', 'subject', 'subjectterms', 'timeperiod', 'uniformtitle']
        }
    },

    // Find a library
    'find-a-library': {
        'title': 'Find a library',
        'link': 'find-a-library',
        'inNavigation': true,
        'settings': {
            'ranges': [
                {'value': 0.25, 'label': 'Within 1/4 mile'},
                {'value': 0.5, 'label': 'Within 1/2 mile'},
                {'value': 1, 'label': 'Within 1 mile'},
                {'value': 2, 'label': 'Within 2 miles'}
            ]
        }
    },

    // Using our libraries
    'using-our-libraries': {
        'title': 'Using our libraries',
        'link': 'using-our-libraries',
        'inNavigation': true,
        'settings': {}
    },

    // My account
    'my-account': {
        'title': 'My account',
        'link': 'my-account',
        'inNavigation': true,
        'settings': {}
    },

    // Library blogs
    'blogs': {
        'title': 'Blogs',
        'link': 'blogs',
        'inNavigation': false,
        'settings': {
            'expiration': 900000,
            'itemsPerPage': 10,
            'url': 'http://mix.chimpfeedr.com/1dc9c-cam-blogs-01Nov13'
        }
    }
};
