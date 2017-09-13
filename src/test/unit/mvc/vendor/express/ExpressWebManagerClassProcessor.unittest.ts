'use strict';

import * as Sinon from "sinon";
import * as chai from "chai";
import {LoggerFactory} from "../../../../../main/logging/LoggerFactory";
import {DependencyManager} from "../../../../../main/dependencyManager/DependencyManager";
import {ControllerLoader} from "../../../../../main/mvc/controller/ControllerLoader";
import {ExpressApiLoader} from "../../../../../main/mvc/vendor/express/ExpressApiLoader";
import {DefaultDependencyManager} from "../../../../../main/dependencyManager/DefaultDependencyManager";
import {TestLoggerFactory} from "../../../TestLoggerFactory";
import ExpressWebManagerClassProcessor from "../../../../../main/mvc/vendor/express/ExpressWebManagerClassProcessor";
import SinonStub = Sinon.SinonStub;

const assert = chai.assert;

describe('ExpressWebManagerClassProcessor', function () {

  let expressApp: any,
    loggerFactory: LoggerFactory,
    expressWebManagerClassProcessor: ExpressWebManagerClassProcessor,
    dependencyManager: DependencyManager,
    controllerLoader: ControllerLoader,
    apiLoader: ExpressApiLoader;

  beforeEach(() => {
    apiLoader = Sinon.createStubInstance(ExpressApiLoader);
    dependencyManager = Sinon.createStubInstance(DefaultDependencyManager);
    expressApp = {get: Sinon.stub(), post: Sinon.stub()};
    loggerFactory = new TestLoggerFactory();
    expressWebManagerClassProcessor = ExpressWebManagerClassProcessor.Builder(expressApp)
      .withApiLoader(apiLoader)
      .withLoggerFactory(loggerFactory)
      .build();
  });

  describe('#onRegisterClass()', function () {
    it('should load API info', async function () {
      // when
      await expressWebManagerClassProcessor.processClass(TestClass, dependencyManager);

      // then
      assert.isTrue((<SinonStub>apiLoader.loadApiInfo).withArgs(TestClass).calledOnce);
    });
  });

  describe('#onLoad()', function () {
    it('should register all loaded APIs', async function () {
      // when
      await expressWebManagerClassProcessor.onApplicationLoad(dependencyManager);

      // then
      assert.isTrue((<SinonStub>apiLoader.registerApis).withArgs(dependencyManager).calledOnce);
    });
  });

  class TestClass {
  }

});