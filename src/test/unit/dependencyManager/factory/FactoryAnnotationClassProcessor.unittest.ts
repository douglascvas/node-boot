'use strict';

import * as Sinon from "sinon";
import * as chai from "chai";
import {DependencyManager} from "../../../../main/dependencyManager/DependencyManager";
import {LoggerFactory} from "../../../../main/logging/LoggerFactory";
import {DefaultDependencyManager} from "../../../../main/dependencyManager/DefaultDependencyManager";
import {TestLoggerFactory} from "../../TestLoggerFactory";
import {FactoryAnnotationClassProcessor} from "../../../../main/dependencyManager/factory/FactoryAnnotationClassProcessor";
import {Factory} from "../../../../main/dependencyManager/factory/Factory";
import SinonStub = Sinon.SinonStub;

const assert = chai.assert;

describe('FactoryAnnotationClassProcessor', function () {

  let factoryAnnotationClassProcessor: FactoryAnnotationClassProcessor,
    dependencyManager: DependencyManager,
    loggerFactory: LoggerFactory;

  beforeEach(() => {
    dependencyManager = Sinon.createStubInstance(DefaultDependencyManager);
    loggerFactory = new TestLoggerFactory();
    factoryAnnotationClassProcessor = FactoryAnnotationClassProcessor.Builder()
      .withLoggerFactory(loggerFactory)
      .build();
  });

  describe('#onRegisterClass()', function () {
    it('should methods annotated with @Factory', async function () {
      // when
      await factoryAnnotationClassProcessor.processClass(TestClass, dependencyManager);

      // then
      assertFactoryIsRegistered('byFactory', TestClass.prototype.create);
    });
  });

  function assertFactoryIsRegistered(target: any, factory: Function, holder?: any) {
    let serviceRegistered = (<SinonStub>dependencyManager.factory).calledWith(target, factory, holder);
    assert.equal(serviceRegistered, serviceRegistered);
  }

  class TestClass {
    @Factory('byFactory')
    public create(): any {
      return 10;
    }
  }
});