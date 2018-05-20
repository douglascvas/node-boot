'use strict';

import * as Sinon from "sinon";
import {InjectableAnnotationClassProcessor} from "../../../../main/di/injectable/InjectableAnnotationClassProcessor";
import {DependencyManager} from "../../../../main/di/DependencyManager";
import {LoggerFactory} from "../../../../main/logging/LoggerFactory";
import {DefaultDependencyManager} from "../../../../main/di/DefaultDependencyManager";
import {TestLoggerFactory} from "../../TestLoggerFactory";
import {Injectable} from "../../../../main/di/injectable/InjectableAnnotation";
import SinonStub = Sinon.SinonStub;

describe('ServiceAnnotationClassProcessor', function () {

  let serviceAnnotationClassProcessor: InjectableAnnotationClassProcessor,
    dependencyManager: DependencyManager,
    loggerFactory: LoggerFactory;

  beforeEach(() => {
    dependencyManager = Sinon.createStubInstance(DefaultDependencyManager);
    loggerFactory = new TestLoggerFactory();
    serviceAnnotationClassProcessor = new InjectableAnnotationClassProcessor({dependencyManager, loggerFactory});
  });

  describe('#onRegisterClass()', function () {
    it('should register class annotated with @Injectable, without args', async function () {
      // when
      await serviceAnnotationClassProcessor.processClass(TestClass);

      // then
      Sinon.assert.calledWith(<SinonStub>dependencyManager.injectable, {
        classz: TestClass,
        dependencies: null,
        name: null,
      });
    });

    it('should register class annotated with @Injectable, with args', async function () {
      // when
      await serviceAnnotationClassProcessor.processClass(TestClassWithName);

      // then
      Sinon.assert.calledWith(<SinonStub>dependencyManager.injectable, {
        classz: TestClassWithName,
        dependencies: null,
        name: 'namedClass',
      });
    });
  });

  @Injectable
  class TestClass {
  }

  @Injectable('namedClass')
  class TestClassWithName {
  }
});