const del = require('del');
const paths = require('./paths');
const typescript = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const mocha = require('gulp-mocha');
const net = require('net');
const through = require('through2');
const watch = require('gulp-watch');
const cache = require('gulp-cached');

module.exports = function (gulp) {
  function cleanMain() {
    return del(paths.outputMain);
  }

  function cleanTest() {
    return del(paths.outputTest);
  }

  function cleanResource() {
    return del(paths.outputResource);
  }

  function compileMain() {
    return compile(paths.source, paths.output);
  }

  function compileTest() {
    return compile(paths.test, paths.output);
  }

  function compileTS(dest) {
    // creating a stream through which each file will pass
    const stream = through.obj(function (file, enc, cb) {
      compile(file, dest);
      cb();
    });
    // returning the file stream
    return stream;
  }

  function unitTest(cb) {
    gulp.src('build/test/**/*.unittest.js', {read: false})
      .pipe(mocha())
      // .once('error', () => {
      //   console.log("TEST Failed!!!");
      //   process.exit(1);
      // })
      .once('end', () => {
        cb();
      })
    ;
  }

  function integrationTest(cb) {
    gulp.src('build/test/**/*.integration.js', {read: false})
      .pipe(mocha())
      // .once('error', () => {
      //   console.log("TEST Failed!!!");
      //   process.exit(1);
      // })
      .once('end', () => {
        cb();
      });
  }

  function copyMain() {
    return gulp.src([`${paths.baseMain}/**/*`, `!${paths.baseMain}/**/*.ts`], {base: `${paths.root}/`})
      .pipe(gulp.dest(paths.output));
  }

  function copyResource() {
    return gulp.src([`${paths.baseResource}/**/*`], {base: `${paths.root}/`})
      .pipe(gulp.dest(paths.output));
  }

  function copyTest() {
    return gulp.src([`${paths.baseTest}/**/*`, `!${paths.baseTest}/**/*.ts`], {base: `${paths.root}/`})
      .pipe(gulp.dest(paths.output));
  }

  function watchTask() {
    return Promise.all([
      watch(`${paths.baseMain}/**/*.ts`, {ignoreInitial: true}, function (file) {
        console.log('compiling', file.history);
        compile(file.history, paths.outputMain, {base: `${paths.baseMain}/`});
        compileMain();
      }),
      watch([`${paths.baseResource}/**/*`], gulp.parallel('be-build:resource')),
      watch([`${paths.baseTest}/**/*`], gulp.parallel('be-build:test'))
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
      // .pipe(cache('linting'))
      .pipe(sourcemaps.init())
      .pipe(tsProject());
    // .pipe(typescript(typescript.longReporter));
    tsResult.dts.pipe(gulp.dest(output));
    return tsResult.js
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(output));
  }

  const portInUse = function (port, callback) {
    const server = net.createServer(function (socket) {
      socket.write('Echo server\r\n');
      socket.pipe(socket);
    });

    server.listen(port, '127.0.0.1');
    server.on('error', function (e) {
      callback(true);
    });
    server.on('listening', function (e) {
      server.close();
      callback(false);
    });
  };

  function waitForApplication(port, callback) {
    const interval = setInterval(() => {
      portInUse(port, used => {
        console.log("# Starting backend server...");
        if (used) {
          console.log("# Backend server started.");
          clearInterval(interval);
          return callback();
        }
      })
    }, 500);
  }

  function start(cb) {
    const server = require('gulp-express');
    server.run([`${paths.outputMain}/index.js`], {}, 35725);
    waitForApplication(3005, cb);
  }

  gulp.task('be-clean:main', cleanMain);
  gulp.task('be-clean:test', cleanTest);
  gulp.task('be-clean:resource', cleanResource);
  gulp.task('be-compile:main', compileMain);
  gulp.task('be-compile:test', compileTest);
  gulp.task('be-copy:main', gulp.series('be-clean:main', copyMain));
  gulp.task('be-copy:resource', gulp.series('be-clean:resource', copyResource));
  gulp.task('be-copy:test', gulp.series('be-clean:test', copyTest));
  gulp.task('be-build:main', gulp.series('be-copy:main', 'be-compile:main'));
  gulp.task('be-build:resource', gulp.series('be-copy:resource'));
  gulp.task('be-build:test', gulp.series('be-copy:test', 'be-compile:test'));
  gulp.task('be-build', gulp.parallel('be-build:main', 'be-build:resource', 'be-build:test'));
  gulp.task('be-test:unit', gulp.series('be-build', unitTest));
  gulp.task('be-test:integration', gulp.series('be-build', integrationTest));
  gulp.task('be-test', gulp.series('be-build', 'be-test:unit', 'be-test:integration'));
  gulp.task('be-start', gulp.series('be-build', start));
  gulp.task('be-watch', gulp.series('be-build', watchTask));
  gulp.task('be-dev', gulp.series('be-watch'));

};