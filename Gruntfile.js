'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    options: {
      serverDir: 'server',
      buildTmpDir: 'build',
      outputDir: 'static/build'
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        node: true,
        strict: true,
        globalstrict: true
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      server: {
        src: ['server.js', '<%= options.serverDir %>/**/*.js']
      },
      test: {
        src: ['test/**/*.js']
      },
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          timeout: 500
        },
        src: ['test/*.js']
      }
    },

    clean: [
      '<%= options.buildTmpDir %>',
      '<%= options.outputDir %>'
    ],

    less: {
      development: {
        files: {
          '<%= options.outputDir %>/main.css': 'less/main.less'
        }
      },
      production: {
        options: {
          yuicompress: true
        },
        files: {
          '<%= options.outputDir %>/main.css': 'less/main.less'
        }
      }
    },

    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      server: {
        files: '<%= jshint.server.src %>',
        tasks: ['jshint:server', 'mochaTest']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'mochaTest']
      },
      less: {
        files: 'less/*.less',
        tasks: ['less:development']
      }
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-conventional-changelog');

  // Default task.
  grunt.registerTask('default', ['jshint', 'clean', 'less:production', 'mochaTest']);
  grunt.registerTask('development', ['jshint', 'clean', 'less:development', 'mochaTest']);
};
