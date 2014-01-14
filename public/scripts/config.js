define([], function() {
    'use strict';
    return {
        'constants': {
            'milesToMetres': 1609.344,
            'streetViewRadius': 50
        },
        'imagePaths': {
            'directionsMarker': '/public/images/directions-icon.png'
        },
        'localStorage': {
            'facetCollapse': 'cambridge_libraries_hidden_facets'
        },
        'pages': [
            'find-a-library',
            'find-a-resource',
            'find-a-resource-results',
            'library-profile',
            'resource-detail',
            'using-our-libraries'
        ]
    };
});
