'use strict';

import * as Sinon from "sinon";
import * as chai from "chai";
import {LoggerFactory} from "../../../../../main/logging/LoggerFactory";
import {DependencyManager} from "../../../../../main/dependencyManager/DependencyManager";
import {ControllerLoader} from "../../../../../main/mvc/controller/ControllerLoader";
import {ExpressApiLoader} from "../../../../../main/mvc/vendor/express/ExpressApiLoader";
import {DefaultDependencyManager} from "../../../../../main/dependencyManager/DefaultDependencyManager";
import {TestLoggerFactory} from "../../../TestLoggerFactory";
import {RequestMappingClassProcessor} from "../../../../../main/mvc/api/RequestMappingClassProcessor";
import SinonStub = Sinon.SinonStub;

const assert = chai.assert;

describe('RequestMappingClassProcessor', function () {

  let expressApp: any,
    loggerFactory: LoggerFactory,
    requestMappingClassProcessor: RequestMappingClassProcessor,
    dependencyManager: DependencyManager,
    apiLoader: ExpressApiLoader;

  beforeEach(() => {
    apiLoader = Sinon.createStubInstance(ExpressApiLoader);
    dependencyManager = Sinon.createStubInstance(DefaultDependencyManager);
    expressApp = {get: Sinon.stub(), post: Sinon.stub()};
    loggerFactory = new TestLoggerFactory();
    requestMappingClassProcessor = RequestMappingClassProcessor.Builder(apiLoader)
      .withLoggerFactory(loggerFactory)
      .build();
  });

  describe('#onRegisterClass()', function () {
    it('should load API info', async function () {
      // when
      await requestMappingClassProcessor.processClass(TestClass, dependencyManager);

      // then
      assert.isTrue((<SinonStub>apiLoader.loadApiInfo).withArgs(TestClass).calledOnce);
    });
  });

  describe('#onLoad()', function () {
    it('should register all loaded APIs', async function () {
      // when
      await requestMappingClassProcessor.onApplicationLoad(dependencyManager);

      // then
      assert.isTrue((<SinonStub>apiLoader.registerApis).withArgs(dependencyManager).calledOnce);
    });
  });

  class TestClass {
  }

});