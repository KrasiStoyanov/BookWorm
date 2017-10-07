/*eslint-env node */
(function() {
    'use strict';

    var gulp = require('gulp');
    var hb = require('gulp-hb');
    var hbLayouts = require('handlebars-layouts');
    var sass = require('gulp-sass');
    var concat = require('gulp-concat');
    var uglify = require('gulp-uglify');
    var rename = require('gulp-rename');
    var sourcemaps = require('gulp-sourcemaps');
    var connect = require('gulp-connect');
    var RevAll = require('gulp-rev-all');
    var autoprefixer = require('gulp-autoprefixer');
    var imagemin = require('gulp-imagemin');
    var pngquant = require('imagemin-pngquant');
    var imageminJpegtran = require('imagemin-jpegtran');
    var htmlmin = require('gulp-htmlmin');

    gulp.task('html', function() {
        return gulp.src('src/templates/pages/**/*.hbs')
            .pipe(hb()
                .data('src/config/portfolio.json')
                .partials('src/templates/partials/**/*.hbs')
                .helpers(hbLayouts)
                .helpers({
                    json: function(context) {
                        return JSON.stringify(context);
                    },
                    limit: function(array, limit, options) {
                        if (!array || array.length == 0) {
                            return options.inverse(this);
                        }

                        var result = [];
                        for (var i = 0; i < limit && i < array.length; ++i) {
                            result.push(options.fn(array[i]));
                        }

                        return result.join('');
                    }
                })
            )
            .pipe(htmlmin({
                collapseWhitespace: true
            }))
            .pipe(rename({
                extname: '.html'
            }))
            .pipe(gulp.dest('build'));
    });

    gulp.task('css', function() {
        return gulp.src('src/sass/**/*.scss')
            .pipe(sourcemaps.init())
            .pipe(
                sass({
                    includePaths: ['./src/sass']
                })
                .on('error', sass.logError)
            )
            .pipe(autoprefixer())
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('build/css'));
    });

    gulp.task('assets', function() {
        return gulp.src('assets/**/*')
            .pipe(gulp.dest('build'));
    });

    gulp.task('assets-production', function() {
        return gulp.src('assets/**/*')
            .pipe(imagemin({
                progressive: true,
                svgoPlugins: [{
                    removeViewBox: false
                }, {
                    cleanupIDs: false
                }],
                use: [pngquant(), imageminJpegtran()]
            }))
            .pipe(gulp.dest('build'));
    });

    gulp.task('json', function() {
        return gulp.src('src/config/*.json')
            .pipe(gulp.dest('build/config'));
    });

    gulp.task('build', ['html', 'css', 'assets', 'json']);
    gulp.task('build-production', ['html', 'css', 'assets-production', 'json']);

    gulp.task('server', function() {
        connect.server({
            root: 'build',
            livereload: true,
            port: 3001
        });
    });

    gulp.task('develop', ['build', 'server'], function() {
        gulp.watch(['src/sass/**/*.scss'], ['css', 'reload']);
        gulp.watch(['src/config/*.json'], ['json', 'reload']);
        gulp.watch(['assets/{images,fonts}/**/*'], ['assets', 'reload']);
        gulp.watch(['src/{config,templates}/**/*'], ['html', 'reload']);
    });

    gulp.task('reload', function() {
        gulp.src('build/*.html').pipe(connect.reload());
    });

    gulp.task('production', ['build-production'], function() {
        return gulp.src('build/**')
            .pipe(gulp.dest('production'));
    });
})();
