var concat        = require('gulp-concat');
var cssnano       = require('gulp-cssnano');
var del           = require('del');
var expires       = new Date().setUTCFullYear(new Date().getFullYear() + 5);
var gulp          = require('gulp');
var jshint        = require('gulp-jshint');
var jshintstylish = require('jshint-stylish');
var livereload    = require('gulp-livereload');
var map           = require('map-stream');
var notify        = require('gulp-notify');
var pkg           = require('./package.json');
var plumber       = require('gulp-plumber');
var prefix        = require('gulp-autoprefixer');
var replace       = require('gulp-replace');
var runsequence   = require('run-sequence');
var sass          = require('gulp-ruby-sass');
var sourcemaps    = require('gulp-sourcemaps');
var uglify        = require('gulp-uglify');

var events = require('events'),
    emmitter = new events.EventEmitter(),
    path = require('path');

var reporter = function(file, cb) {
    return map(function(file, cb) {
        if (!file.jshint.success) {
            file.jshint.results.forEach(function(err) {
                if (err) {
                    var msg = [
                        path.basename(file.path),
                        'Line: ' + err.error.line,
                        'Error: ' + err.error.reason
                    ];
                    emmitter.emit('error', new Error(msg.join('\n')));
                }
            });
        }
        cb(null, file);
    });
};

/**
 * Compile our Sass. This currently uses the gulp-ruby-sass however, once Inuit
 * supports lib-sass, this should be used instead as it's 5000x quicker.
 */
gulp.task('sass', function() {
    return sass('src/scss/modal.scss', {
            style: 'compressed'
        })
        .pipe(replace('/*!', '/*'))
        .pipe(sourcemaps.write('maps', {
            includeContent: false,
            sourceRoot: 'source'
        }))
        .pipe(prefix({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cssnano())
        .on('error', notify.onError())
        .pipe(gulp.dest('dist/css'))
        .pipe(notify("SCSS compiled: <%=file.relative%>"))
        .pipe(livereload());
});

/**
 * Concatenate, lint and compress our JavaScript
 */
gulp.task('scripts', ['external-scripts'], function() {
    return gulp.src('src/js/*.js')
        .pipe(concat('modal.min.js'))
        .pipe(plumber())
        .pipe(jshint())
        .pipe(jshint.reporter(jshintstylish))
        .on('error', notify.onError(function(error) {
            return error.message;
        }))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
        .pipe(notify("JS compiled: <%=file.relative%>"))
        .pipe(livereload());
});

/**
 * Add external scripts from bower here. The reason this is seperate is to
 * remove the usage of JSHint (we don't want to see errors we can't fix).
 */
gulp.task('external-scripts', function() {
    return gulp.src([
            'bower_components/jquery/dist/jquery.min.js'
        ])
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(gulp.dest('example/js'))
        .pipe(livereload());
});

/**
 * Clear the .sass-cache directory
 *
 * This function may only need to be used a handful of times, but can sort any
 * issues when compiling stylesheets with includes.
 */
gulp.task('clear-sass-cache', function() {
    return del('.sass-cache/*', function(paths) {
        console.log('Files deleted:\n', paths.join('\n'));
    });
});

/**
 * Our watch script. Watches for changes in files to run the relevant
 * function that compiles the required code.
 */
 gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('src/scss/*.scss', ['sass']);
    gulp.watch('src/js/*.js', ['scripts']);
});

/**
 * Build task (runs when running `gulp build` from the command line)
 *
 * This is used as a shortcut for the default task but mainly to seperate out
 * the compiling processes and return a finished output (without including The
 * watch task). This also deals with running gulp tasks in order.
 */
gulp.task('build', function(cb) {
    runsequence( ['sass', 'scripts'], cb);
});

/**
 * Default task (runs when running `gulp` from the command line)
 *
 * Each of these functions can also be run individually from the command line
 * by using `gulp {function}`. Taking the clear-sass-cache function as an
 * example, you would run `gulp clear-sass-cache` from the command line.
 */
gulp.task('default', function(cb) {
    runsequence('build', 'watch', cb);
});
