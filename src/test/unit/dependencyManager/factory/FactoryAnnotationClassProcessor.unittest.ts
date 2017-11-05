'use strict';

import * as Sinon from "sinon";
import * as chai from "chai";
import {DependencyManager} from "../../../../main/di/DependencyManager";
import {LoggerFactory} from "../../../../main/logging/LoggerFactory";
import {DefaultDependencyManager} from "../../../../main/di/DefaultDependencyManager";
import {TestLoggerFactory} from "../../TestLoggerFactory";
import {FactoryAnnotationClassProcessor} from "../../../../main/di/factory/FactoryAnnotationClassProcessor";
import {Factory} from "../../../../main/di/factory/FactoryAnnotation";
import SinonStub = Sinon.SinonStub;

const assert = chai.assert;

describe('FactoryAnnotationClassProcessor', function () {

  let factoryAnnotationClassProcessor: FactoryAnnotationClassProcessor,
    dependencyManager: DependencyManager,
    loggerFactory: LoggerFactory;

  beforeEach(() => {
    dependencyManager = Sinon.createStubInstance(DefaultDependencyManager);
    loggerFactory = new TestLoggerFactory();
    factoryAnnotationClassProcessor = new FactoryAnnotationClassProcessor({dependencyManager, loggerFactory});
  });

  describe('#onRegisterClass()', function () {
    it('should methods annotated with @Factory', async function () {
      // when
      await factoryAnnotationClassProcessor.processClass(TestClass);

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