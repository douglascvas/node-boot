'use strict';

import * as Sinon from "sinon";
import * as chai from "chai";
import {LoggerFactory} from "../../../../main/logging/LoggerFactory";
import {TestLoggerFactory} from "../../TestLoggerFactory";
import {AutoScannerClassProvider, AutoScannerClassProviderBuilder} from "../../../../main/core/autoScanner/AutoScannerClassProvider";
import {FileScanner} from "../../../../main/core/autoScanner/FileScanner";
import SinonStub = Sinon.SinonStub;

const assert = chai.assert;

describe('AutoScannerClassProvider', function () {

  const INCLUDE_PATHS = ['i1.js', 'i2.js'];
  const EXCLUDE_PATHS = ['e1.js', 'e2.js'];

  let autoScannerClassProvider: AutoScannerClassProvider,
    autoScannerClassProviderBuilder: AutoScannerClassProviderBuilder,
    fileManager: FileScanner,
    loggerFactory: LoggerFactory;

  beforeEach(() => {
    fileManager = Sinon.createStubInstance(FileScanner);
    loggerFactory = new TestLoggerFactory();
  });

  describe('#provideClasses()', function () {
    it('should scan classes', async function () {
      // given
      let file1 = Sinon.stub();
      let file2 = Sinon.stub();
      let class1 = <any>Sinon.stub();
      let class2 = <any>Sinon.stub();
      let autoScanOptions = {include: INCLUDE_PATHS, exclude: EXCLUDE_PATHS};
      autoScannerClassProvider = AutoScannerClassProvider.Builder(autoScanOptions).withFileScanner(fileManager)
        .withLoggerFactory(loggerFactory).build();
      (<SinonStub>fileManager.find).withArgs('i1.js|i2.js', Sinon.match({ignore: 'e1.js|e2.js'})).returns([file1, file2]);
      (<SinonStub>fileManager.load).withArgs(file1).returns({'Class1': class1});
      (<SinonStub>fileManager.load).withArgs(file2).returns({'Class2': class2});

      // when
      let classInfo = await autoScannerClassProvider.provideClasses();

      // then
      assert.deepEqual(classInfo[0], {name: 'Class1', classz: class1});
      assert.deepEqual(classInfo[1], {name: 'Class2', classz: class2});
    });

  });
});