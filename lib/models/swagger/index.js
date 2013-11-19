module.exports = {
    'FAQs': {
        'id': 'faqs',
        'type': 'Array',
        'items': {
            '$ref': 'FAQ'
        }
    },
    'FAQ': {
        'id': 'faq',
        'type': 'Object',
        'properties': {
            'name': {
                'type': 'string'
            }
        }
    },
    'Libraries': {
        'id': 'libraries',
        'type': 'Array',
        'items': {
            '$ref': 'Library'
        }
    },
    'Library': {
        'id': 'Library',
        'type': 'Object',
        'properties': {
            'name': {
                'type': 'string'
            },
            'code': {
                'type': 'string'
            },
            'postal_address': {
                'type': 'string'
            },
            'postcode': {
                'type': 'string'
            },
            'web_address': {
                'type': 'string'
            },
            'lat': {
                'type': 'string'
            },
            'long': {
                'type': 'string'
            },
            'type': {
                'type': 'string'
            },
            'opening_hours': {
                'type': 'string'
            },
            'images': {
                'type': 'Array'
            }
        }
    },
    'Results': {
        'id': 'Results',
        'type': 'Object',
        'properties': {
            'aquabrowser': {
                'rowCount': {
                    'type': 'Number'
                },
                'facets': {
                    'type': 'Array'
                },
                'items': {
                    'type': 'Array',
                    'items': {
                        '$ref': 'Result'
                    }
                }
            },
            'summon': {
                'rowCount': {
                    'type': 'Number'
                },
                'facets': {
                    'type': 'Array'
                },
                'items': {
                    'type': 'Array',
                    'items': {
                        '$ref': 'Result'
                    }
                }
            }
        }
    },
    'Result': {
        'id': 'Result',
        'type': 'Object',
        'properties': {
            'id': {
                'type': 'string'
            },
            'title': {
                'type': 'string'
            },
            'author': {
                'type': 'string'
            },
            'date': {
                'type': 'string'
            },
            'link': {
                'type': 'string'
            },
            'contentType': {
                'type': 'string'
            },
            'publicationDate': {
                'type': 'string'
            },
            'branch': {
                'type': 'string'
            }
        }
    }
}
