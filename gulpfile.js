'use strict';

var gulp    = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');

gulp.task('clean', function() {

  gulp.src('dist/**/*', {read: false})
    .pipe($.clean());
});

gulp.task('css', function() {

  return gulp.src('assets/css/*')
    .pipe(gulp.dest('dist/css'));
});

// Copy all static images
gulp.task('images', function() {
  return gulp.src('assets/img/*')
    // Pass in options to the task
    //.pipe($.imagemin({optimizationLevel: 5}))
    //.pipe(gulp.dest('dist/images'));
});

gulp.task('examples', function() {

  return gulp.src('examples/*')
    .pipe(gulp.dest('dist/examples'));
});

gulp.task('build', ['clean', 'css', 'images', 'examples'], function () {

  // build js
  gulp.src(['src/jquery.address.js'])
    // .pipe($.concat('jquery.address.js'))
    .pipe($.wrap(';(function ($, document) {<%= contents %>})(jQuery, document);'))
    .pipe(gulp.dest('dist'))
    .pipe($.rename({ suffix: '.min'}))
    .pipe($.uglify({ outSourceMap: true, mangle: true, report: 'gzip' }))
    .pipe($.size({ showFiles: true }))
    .pipe(gulp.dest('dist'));
});

gulp.task('browser-sync', function() {

  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
});

gulp.task('watch', function () {

  gulp.watch(['src/*.js'], ['build']);
});

gulp.task('default', ['build', 'browser-sync', 'watch']);

gulp.task('publish', ['build'], function () {

  // bump bower, npm versions
  gulp.src(['package.json', 'bower.json'])
    .pipe($.bump())
    .pipe(gulp.dest('.'));
});

