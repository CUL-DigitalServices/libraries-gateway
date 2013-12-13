var config = module.exports = require('./config_private');

config.server = {
    'port': 5000
};

config.app = {
    'title': 'Cambridge Libraries',
    'hostname': 'localhost:5000'
};

// Constants //
config.constants = {
    'engines': {
        'aquabrowser': {
            'timeout': 5000,
            'uri': 'http://search.lib.cam.ac.uk/result.ashx',
            'uri_suggestions': 'http://search.lib.cam.ac.uk/AquaServer.ashx'
        },
        'summon': {
            'timeout': 10000,
            'uri': 'api.summon.serialssolutions.com',
            'version': '/2.0.0/search'
        }
    },
    'formats': {
        'books': {
            'aquabrowser': 'book',
            'summon': 'Book'
        },
        'ebooks': {
            'aquabrowser': 'ebook',
            'summon': 'eBook'
        },
        'ejournals': {
            'aquabrowser': 'ejournal',
            'summon': 'Ejournal'
        },
        'manuscripts': {
            'aquabrowser': 'manuscript',
            'summon': 'Manuscript'
        },
        'journals': {
            'aquabrowser': 'journal',
            'summon': 'Journal Article'
        },
        'paper': {
            'aquabrowser': 'paper',
            'summon': 'paper'
        }
    },
    'refresh': {
        'twitter': {
            'tweet_expiration': 900000
        }
    },
    'search': {
        'pageLimit': 40,
        'parameters': ['api', 'author', 'format', 'id', 'page', 'q']
    }
};

// Nodes //
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
