module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        watch: {
            less: {
                files: ['public/less/**/*.less'],
                tasks: ['recess']
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
            development: {
                files: [
                    {
                        expand: true,
                        cwd: 'public/less',
                        src: ['**/*.less'],
                        dest: 'public/styles',
                        ext: '.css'
                    }
                ]
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
