module.exports = function (grunt) {
    'use strict';

    var lessFiles = {
        'public/styles/libraries-gateway.css': ['public/less/libraries-gateway.less']
    };

    grunt.initConfig({
        watch: {
            less: {
                files: ['public/less/**/*.less'],
                tasks: ['recess:compile']
            },
            jshint: {
                files: [
                    'public/scripts/**/*.js',
                    'lib/**/*.js'
                ],
                tasks: [
                    'jshint:app',
                    'jshint:backend'
                ]
            }
        },
        recess: {
            options: {
                compile: true
            },
            compile: {
                files: lessFiles
            },
            lint: {
                options: {
                    compile: false
                },
                files: lessFiles
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            app: {
                src: [
                    'public/scripts/**/*.js'
                ]
            },
            backend: {
                src: [
                    'lib/**/*.js'
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
};
