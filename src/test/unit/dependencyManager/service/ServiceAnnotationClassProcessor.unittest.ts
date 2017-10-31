'use strict';

import * as Sinon from "sinon";
import {ServiceAnnotationClassProcessor} from "../../../../main/dependencyManager/service/ServiceAnnotationClassProcessor";
import {DependencyManager} from "../../../../main/dependencyManager/DependencyManager";
import {LoggerFactory} from "../../../../main/logging/LoggerFactory";
import {DefaultDependencyManager} from "../../../../main/dependencyManager/DefaultDependencyManager";
import {TestLoggerFactory} from "../../TestLoggerFactory";
import {Service} from "../../../../main/dependencyManager/service/ServiceAnnotation";
import SinonStub = Sinon.SinonStub;

describe('ServiceAnnotationClassProcessor', function () {

  let serviceAnnotationClassProcessor: ServiceAnnotationClassProcessor,
    dependencyManager: DependencyManager,
    loggerFactory: LoggerFactory;

  beforeEach(() => {
    dependencyManager = Sinon.createStubInstance(DefaultDependencyManager);
    loggerFactory = new TestLoggerFactory();
    serviceAnnotationClassProcessor = ServiceAnnotationClassProcessor.Builder()
      .withLoggerFactory(loggerFactory)
      .build();
  });

  describe('#onRegisterClass()', function () {
    it('should register class annotated with @Service, without args', async function () {
      // when
      await serviceAnnotationClassProcessor.processClass(TestClass, dependencyManager);

      // then
      Sinon.assert.calledWith(<SinonStub>dependencyManager.service, {
        classz: TestClass,
        dependencies: null,
        name: null,
        skipParentRegistration: null
      });
    });

    it('should register class annotated with @Service, with args', async function () {
      // when
      await serviceAnnotationClassProcessor.processClass(TestClassWithName, dependencyManager);

      // then
      Sinon.assert.calledWith(<SinonStub>dependencyManager.service, {
        classz: TestClassWithName,
        dependencies: null,
        name: 'namedClass',
        skipParentRegistration: null
      });
    });
  });

  @Service
  class TestClass {
  }

  @Service('namedClass')
  class TestClassWithName {
  }
});