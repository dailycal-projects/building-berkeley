const gulp = require('gulp');

module.exports = () => {
  return gulp.src('src/data/**')
    .pipe(gulp.dest('dist/data'))
};
