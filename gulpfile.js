var gulp = require('gulp'),
  gutil = require('gulp-util'),
  jshint = require('gulp-jshint'),
  sourcemaps = require('gulp-sourcemaps'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  sass = require('gulp-sass'),
  imagemin = require('gulp-imagemin');

input = {
    'scripts': 'source/scripts/**/*.js',
    'vendorjs': 'public/assets/scripts/vendor/**/*.js'
  },

  output = {
    'styles': 'public/assets/styles',
    'scripts': 'public/assets/scripts'
  };

//Define the default task and add the watch task to it
gulp.task('default', ['watch']);

//minify images
gulp.task('minifyImages', function() {
  return gulp.src('public/assets/images/*')
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }]
    }))
    .pipe(gulp.dest('public/assets/images'));

});

gulp.task('copyHTML', function() {
  //copy any html files in source/ to public/
  gulp.src('source/*.html')
    .pipe(gulp.dest('public'));
});

//configure the jshint task
gulp.task('jshint', function() {
  return gulp.src(input.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));

});

//Convert SCSS to CSS and place in public/assets/styles folder
gulp.task('build-css', function() {
  return gulp.src('source/scss/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(output.styles));
});

//Concat and uglify javascript files
gulp.task('build-js', function() {
  return gulp.src(input.scripts)
    .pipe(sourcemaps.init())
    .pipe(concat('bundle.js'))
    //only uglify if gulp is ran with '--type production'
    .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(output.scripts));
});
//watch task that runs all other tasks.
gulp.task('watch', function() {
  gulp.watch(input.scripts, ['jshint', 'build-js']);
  gulp.watch(input.sass, ['build-css']);
  gulp.watch('public/assets/images/*', ['minifyImages']);
});


//build all
gulp.task('build', ['build-js', 'jshint', 'build-css', 'minifyImages'])


gulp.task('log', function() {
  gutil.log('== My log task ==');

});
