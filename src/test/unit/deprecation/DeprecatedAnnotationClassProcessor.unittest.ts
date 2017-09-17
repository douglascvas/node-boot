'use strict';

import * as Sinon from "sinon";
import {SinonSpy} from "sinon";
import * as chai from "chai";
import {DependencyManager} from "../../../main/dependencyManager/DependencyManager";
import {DeprecatedAnnotationClassProcessor} from "../../../main/deprecation/DeprecatedAnnotationClassProcessor";
import {DefaultDependencyManager} from "../../../main/dependencyManager/DefaultDependencyManager";
import {TestLoggerFactory} from "../TestLoggerFactory";
import {LoggerFactory} from "../../../main/logging/LoggerFactory";
import {Deprecated} from "../../../main/deprecation/Deprecated";
import {Logger} from "../../../main/logging/Logger";
import {ConsoleLogger} from "../../../main/logging/ConsoleLogger";
import SinonStub = Sinon.SinonStub;

const assert = chai.assert;

describe('DeprecatedAnnotationClassProcessor', function () {

  let deprecatedAnnotationClassProcessor: DeprecatedAnnotationClassProcessor,
    dependencyManager: DependencyManager,
    loggerFactory: LoggerFactory,
    logger: Logger;

  beforeEach(() => {
    logger = new ConsoleLogger("DeprecatedAnnotationClassProcessorTest");
    Sinon.spy(logger, 'warn');
    dependencyManager = Sinon.createStubInstance(DefaultDependencyManager);
    loggerFactory = Sinon.createStubInstance(TestLoggerFactory);
    (<SinonStub>loggerFactory.getLogger).returns(logger);
    deprecatedAnnotationClassProcessor = DeprecatedAnnotationClassProcessor.Builder()
      .withLoggerFactory(loggerFactory)
      .build();
  });

  describe('#onRegisterClass()', function () {
    it('should register methods annotated with @Deprecated', async function () {
      // when
      await deprecatedAnnotationClassProcessor.processClass(TestClass, dependencyManager);

      // then
      Sinon.assert.calledWith((<SinonSpy>logger.warn), Sinon.match("Class 'TestClass' is deprecated and should not be used anymore. I am sorry for this class!"));
      Sinon.assert.calledWith((<SinonSpy>logger.warn), Sinon.match("Method 'TestClass.create' is deprecated and should not be used anymore. I am sorry for this method!"));
    });
  });


  @Deprecated('I am sorry for this class!')
  class TestClass {
    @Deprecated('I am sorry for this method!')
    public create(): any {
      return 10;
    }
  }
});