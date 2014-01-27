module.exports = function (grunt) {
    'use strict';

    var lessFiles = [
        'public/components/project-light/stylesheets/full-stylesheet.custom.css',
        'public/less/libraries-gateway.less'
    ];

    // Timeout to determine when a test failed
    var MOCHA_TIMEOUT = 40000;

    // Grunt configuration
    grunt.initConfig({
        'watch': {
            'less': {
                'files': ['public/less/**/*.less'],
                'tasks': ['less:dev']
            },
            'jshint': {
                'files': [
                    'public/scripts/**/*.js',
                    'lib/**/*.js'
                ],
                'tasks': [
                    'jshint:app',
                    'jshint:backend'
                ]
            }
        },
        'casperjs': {
            'options': {
                'casperjsOptions': [
                    '--includes=tests/casperjs/include/config.js,tests/casperjs/include/util.js'
                ]
            },
            'files': ['tests/casperjs/test/**/*.js']
        },
        'copy': {
            'build': {
                'files': [{
                    'expand': true,
                    'dest': '<%= outputDir %>',
                    'src': [
                        './**',
                        '!./public/**',
                        './public/errors/**',
                        './public/swagger/**'
                    ]
                }]
            }
        },
        'requirejs': {
            'build': {
                'options': {
                    'baseUrl': 'public/scripts',
                    'out': '<%= outputDir %>/public/scripts/app.min.js',
                    'name': '../components/requirejs/require',
                    'mainConfigFile': 'public/scripts/main.js',
                    'include': [
                        'main',
                        'view/page/find-a-library',
                        'view/page/find-a-resource',
                        'view/page/find-a-resource-results',
                        'view/page/library-profile',
                        'view/page/resource-detail',
                        'view/page/using-our-libraries'
                    ],
                    'insertRequire': ['main'],
                    'wrap': true
                }
            }
        },
        'imagemin': {
            'build': {
                'files': [{
                    'expand': true,
                    'cwd': 'public/images',
                    'src': ['**/*.{jpg,png,gif}'],
                    'dest': '<%= outputDir %>/public/images'
                }]
            }
        },
        'less': {
            'dev': {
                'files': {
                    'public/styles/libraries-gateway.css': lessFiles
                }
            },
            'build': {
                'options': {
                    'compress': true,
                    'cleancss': true
                },
                'files': {
                    '<%= outputDir %>/public/styles/libraries-gateway.css': lessFiles
                }
            }
        },
        'rev': {
            'build': {
                'files': {
                    'src': [
                        '<%= outputDir %>/public/scripts/**/*.js',
                        '<%= outputDir %>/public/styles/**/*.css',
                        '<%= outputDir %>/public/images/**/*.{png,jpg,gif}'
                    ]
                }
            }
        },
        'clean': {
            'options': {
                'force': true
            },
            'build': ['<%= outputDir %>']
        },
        'jshint': {
            'options': {
                'jshintrc': '.jshintrc'
            },
            'app': {
                'src': [
                    'GruntFile',
                    'public/scripts/**/*.js'
                ]
            },
            'backend': {
                'src': [
                    'lib/**/*.js'
                ]
            }
        },
        'mocha-hack': {
            'all': {
                'src': ['tests/mocha/beforeTests.js', 'tests/mocha/**/*.js', 'tests/mocha/**/**/*.js'],
                'options': {
                    'timeout': MOCHA_TIMEOUT,
                    'ignoreLeaks': false,
                    'reporter': 'spec',
                    'bail': true,
                    'growl': true,
                    'slow': 500
                }
            }
        },
        'usemin': {
            'html': [
                '<%= outputDir %>/lib/views/**/*.ejs',
                '<%= outputDir %>/public/errors/**/*.html'
            ],
            'css': [
                '<%= outputDir %>/public/styles/**/*.css'
            ],
            'js': [
                '<%= outputDir %>/public/scripts/**/*.js'
            ],
            'options': {
                'assetsDirs': ['<%= outputDir %>', '<%= outputDir %>/public/images'],
                'patterns': {
                    'js': [
                        [/(directions-icon\.png)/g, 'Replacing reference to directions-icon.png']
                    ]
                }
            }
        },
        'replace': {
            'build': {
                'overwrite': true,
                'replacements': [
                    {
                        'from': 'components/requirejs/require.js',
                        'to': 'scripts/app.min.js'
                    },
                    {
                        'from': ' data-main="/public/scripts/main.js"',
                        'to': ''
                    }
                ],
                'src': [
                    '<%= outputDir %>/lib/views/index.ejs',
                    '<%= outputDir %>/public/errors/**/*.html'
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-casperjs');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mocha-hack');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('grunt-rev');

    // Register Mocha unit-tests as a Grunt task
    grunt.registerTask('run-unit-tests', function() {
        grunt.task.run('mocha-hack:all');
    });

    // Register Grunt deployment tasks
    grunt.registerTask('build', function(outputDir) {
        grunt.config.set('outputDir', outputDir || './dist');
        // Empty the dist folder
        grunt.task.run('clean:build');
        // Copy all the files to this folder except for '/public'
        grunt.task.run('copy:build');
        // Compile all less to 'dist/public/styles'
        grunt.task.run('less:build');
        // Minify all javascript to 'dist/public/scripts/app.min.js'
        grunt.task.run('requirejs:build');
        // Copy and optimize all images to 'dist/public/images'
        grunt.task.run('imagemin:build');
        // Generate unique hashes for each file
        grunt.task.run('rev:build');
        // Replace the requirejs script tag in 'index.ejs' with a script tag pointing to 'app.min.js'
        grunt.task.run('replace:build');
        // Update the asset paths in the templates, css and js to use the correct hashed filenames
        grunt.task.run('usemin');
    });
};
