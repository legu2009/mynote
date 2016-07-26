var gulp = require('gulp');

var jade = require('gulp-jade');
var stylus = require('gulp-stylus');

 
gulp.task('jade', function() {
  gulp.src('./src/*.jade')
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest('./src/'))
});

gulp.task('stylus', function() {
  gulp.src('./src/css/*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./src/css/'));
});

gulp.task('develop', function() {
	gulp.run(['jade', 'stylus']);
	gulp.watch(['./v3-cj-woniu-com/static/2016/*.jade'], ['jade']);
	gulp.watch(['./v3-cj-woniu-com/static/2016/css/*.styl'], ['stylus']);
});