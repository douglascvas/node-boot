const path = require('path');

const srcRoot = absolutePath('src/');
const outputRoot = absolutePath('lib/');
const mainRoot = `${srcRoot}/main`;
const resourceRoot = `${srcRoot}/resource`;
const testRoot = `${srcRoot}/test`;

function absolutePath(relativePath) {
  return path.resolve(`${__dirname}/${relativePath}`);
}

module.exports = {
  root: `${srcRoot}`,
  baseMain: `${mainRoot}`,
  baseTest: `${testRoot}`,
  tsConfig: absolutePath(`tsconfig.json`),
  typings: absolutePath(`typings/`),
  source: `${mainRoot}/**/*.ts`,
  test: `${testRoot}/**/*.ts`,
  output: `${outputRoot}/`,
  outputMain: `${outputRoot}/main`,
  outputTest: `${outputRoot}/test`,
  dtsSrc: [
    absolutePath('typings/**/*.d.ts')
  ]
};