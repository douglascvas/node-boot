'use strict';

import * as Sinon from "sinon";
import * as chai from "chai";
import {LoggerFactory} from "../../../../../main/logging/LoggerFactory";
import {DependencyManager} from "../../../../../main/di/DependencyManager";
import {ExpressApiLoader} from "../../../../../main/web/vendor/express/ExpressApiLoader";
import {DefaultDependencyManager} from "../../../../../main/di/DefaultDependencyManager";
import {TestLoggerFactory} from "../../../TestLoggerFactory";
import {ExpressRequestMappingClassProcessor} from "../../../../../main/web/vendor/express/ExpressRequestMappingClassProcessor";
import SinonStub = Sinon.SinonStub;

const assert = chai.assert;

describe('RequestMappingClassProcessor', function () {

  let expressApp: any,
    loggerFactory: LoggerFactory,
    requestMappingClassProcessor: ExpressRequestMappingClassProcessor,
    dependencyManager: DependencyManager,
    apiLoader: ExpressApiLoader;

  beforeEach(() => {
    apiLoader = Sinon.createStubInstance(ExpressApiLoader);
    dependencyManager = Sinon.createStubInstance(DefaultDependencyManager);
    expressApp = {get: Sinon.stub(), post: Sinon.stub()};
    loggerFactory = new TestLoggerFactory();
    requestMappingClassProcessor = new ExpressRequestMappingClassProcessor({expressApp, dependencyManager, loggerFactory});
  });

  describe('#onRegisterClass()', function () {
    it('should load API info', async function () {
      // when
      await requestMappingClassProcessor.processClass(TestClass);

      // then
      assert.isTrue((<SinonStub>apiLoader.loadApiInfo).withArgs(TestClass).calledOnce);
    });
  });

  describe('#onLoad()', function () {
    it('should register all loaded APIs', async function () {
      // when
      await requestMappingClassProcessor.onApplicationLoad();

      // then
      assert.isTrue((<SinonStub>apiLoader.registerApis).withArgs(dependencyManager).calledOnce);
    });
  });

  class TestClass {
  }

});