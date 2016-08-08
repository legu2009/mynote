var gulp = require('gulp');

var jade = require('gulp-jade');
var stylus = require('gulp-stylus');
var gutil = require('gulp-util');

var vuefile = require("./gulp-vue");
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');

var path = './src/';
gulp.task('vue', () => {
    return gulp.src(path + '_components/*.vue')
        //.pipe(sourcemaps.init())
        .pipe(vuefile())
        .on('error', gutil.log)
        .pipe(babel({
            presets: ['es2015']
        }))
        .on('error', gutil.log)
        //.pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(path + 'components/'));
});

gulp.task('jade', function() {
    gulp.src(path + '*.jade')
        .pipe(jade({pretty: true}))
        .on('error', gutil.log)
        .pipe(gulp.dest(path))
});

gulp.task('stylus', function() {
  gulp.src(path + 'css/*.styl')
    .pipe(stylus())
    .on('error', gutil.log)
    .pipe(gulp.dest(path + 'css/'));
});

gulp.task('develop', function() {
    gulp.run(['jade', 'stylus', 'vue']);
    gulp.watch([path + '*.jade'], ['jade']);
    gulp.watch([path + 'css/*.styl'], ['stylus']);
    gulp.watch([path + 'components/*.vue'], ['vue']);
});

