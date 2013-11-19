var config = module.exports = {};

config.server = {
    'port': 5000
};

config.app = {
    'title': 'Libraries Gateway'
};

// Constants //
config.constants = {
    'libraries': {
        'timeout': 5000,
        'uri': 'http://www.lib.cam.ac.uk/api/local/libraries_data.cgi'
    },
    'engines': {
        'aquabrowser': {
            'timeout': 5000,
            'uri': 'http://search.lib.cam.ac.uk/result.ashx'
        },
        'summon': {
            'auth': {
                'id':   '',
                'key':  ''
            },
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
            'summon': ''            
        }
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
