const del = require('del');
const paths = require('./paths');
const typescript = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const mocha = require('gulp-mocha');
const watch = require('gulp-watch');
const gulp = require('gulp');
const path = require('path');

function cleanMain() {
  return del(paths.outputMain);
}

function compileMain() {
  return compile(paths.source, paths.output);
}

function compileIndex() {
  return compile('src/index.ts', paths.output);
}

function unitTest(cb) {
  gulp.src('lib/test/**/*.unittest.js', {read: false})
    .pipe(mocha())
    .once('end', () => {
      cb();
    });
}

function watchTask() {
  return Promise.all([
    watch(`${paths.baseMain}/**/*.ts`, {ignoreInitial: true}, function (file) {
      console.log('compiling', file.history);
      compile(file.history, paths.outputMain, {base: `${paths.baseMain}/`});
      compileMain();
    }),
    watch([`${paths.baseTest}/**/*`], gulp.parallel('compile:test'))
  ]);
}

function compile(source, output, options) {
  options = options || {base: `${paths.root}/`};
  if (!source instanceof Array) {
    source = [source];
  }
  const sourceTsFiles = [`${paths.typings}/**/*.ts`].concat(source);
  const tsProject = typescript.createProject(paths.tsConfig);
  const tsResult = gulp.src(sourceTsFiles, options)
    .pipe(sourcemaps.init())
    .pipe(tsProject());
  tsResult.dts.pipe(gulp.dest(output));
  return tsResult.js
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(output));
}

process.on('unhandledRejection', (e) => {
  console.trace('Error: ', e);
});

gulp.task('clean', cleanMain);
gulp.task('compile', compileMain);
gulp.task('build', gulp.parallel('compile', compileIndex));
gulp.task('watch', gulp.series('build', watchTask));
