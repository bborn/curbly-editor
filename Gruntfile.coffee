# Generated on 2015-04-28 using generator-bower 0.0.1
'use strict'

mountFolder = (connect, dir) ->
    connect.static require('path').resolve(dir)

module.exports = (grunt) ->
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)

  yeomanConfig =
    src: 'src'
    dist : 'dist'
    build : 'build'
  grunt.initConfig
    yeoman: yeomanConfig

    coffee:
      dist:
        files: [
          expand: true
          cwd: '<%= yeoman.src %>'
          src: '{,*/}*.coffee'
          dest: '<%= yeoman.build %>'
          ext: '.js'
        ]

    concat:
       css:
         src: [
          'bower_components/medium-editor/dist/css/themes/default.css'
          'bower_components/medium-editor/dist/css/medium-editor.css'
          'bower_components/medium-editor-insert-plugin/dist/css/medium-editor-insert-plugin.css'
         ]
         dest: 'src/sass/_medium.scss'

    copy:
      dev:
        files: [{
          cwd: '<%= yeoman.src %>/js',
          src: '*',
          dest: '<%= yeoman.build %>/js/',
          expand: true
        }]

    sass:
      dist:
        files:
          '<%=yeoman.dist %>/css/curbly-editor.css': '<%=yeoman.src %>/sass/curbly-editor.scss'

    directives:
      files:
        src     : '<%=yeoman.build %>/js/curbly-editor.js',
        dest    : '<%=yeoman.dist %>/js/curbly-editor.js'

    clean:
      build: ["<%=yeoman.build %>"]
      dist: ["<%=yeoman.dist %>"]

    jasmine:
      src : 'src/**/*.js'
      specs : 'spec/**/*.js'

    grunt.registerTask 'default', [
      # 'jasmine'
      'clean'
      'copy'
      'coffee'
      'directives'
      'concat'
      'sass'
      'clean:build'
    ]
