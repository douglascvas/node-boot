'use strict';

import * as Sinon from "sinon";
import {ApplicationManager} from "../../main/ApplicationManager";
import {LoggerFactory} from "../../main/logging/LoggerFactory";
import {DependencyManager} from "../../main/dependencyManager/DependencyManager";
import {TestLoggerFactory} from "./TestLoggerFactory";
import {DefaultDependencyManager} from "../../main/dependencyManager/DefaultDependencyManager";
import {Service} from "../../main/dependencyManager/service/Service";
import {ClassInfo} from "../../main/ClassInfo";
import {ServiceAnnotationClassProcessor} from "../../main/dependencyManager/service/ServiceAnnotationClassProcessor";
import {FactoryAnnotationClassProcessor} from "../../main/dependencyManager/factory/FactoryAnnotationClassProcessor";
import {AutoScannerClassProvider} from "../../main/core/autoScanner/AutoScannerClassProvider";
import {ClassProvider} from "../../main/core/ClassProvider";
import {ClassProcessor} from "../../main/core/ClassProcessor";
import SinonStub = Sinon.SinonStub;

describe('ApplicationManager', function () {

  let appManager: ApplicationManager;
  let loggerFactory: LoggerFactory;
  let dependencyManager: DependencyManager;
  let serviceAnnotationClassProcessor: ServiceAnnotationClassProcessor;
  let factoryAnnotationClassProcessor: FactoryAnnotationClassProcessor;
  let autoScannerClassProvider: AutoScannerClassProvider;
  let classProvider1: ClassProvider;
  let classProvider2: ClassProvider;
  let testClassProcessor: ClassProcessor;
  const UNIT_NAME = "test1";

  beforeEach(() => {
    serviceAnnotationClassProcessor = Sinon.createStubInstance(ServiceAnnotationClassProcessor);
    factoryAnnotationClassProcessor = Sinon.createStubInstance(FactoryAnnotationClassProcessor);
    autoScannerClassProvider = Sinon.createStubInstance(AutoScannerClassProvider);
    classProvider1 = Sinon.createStubInstance(TestClassProviderImpl);
    classProvider2 = Sinon.createStubInstance(TestClassProviderImpl);
    testClassProcessor = Sinon.createStubInstance(TestClassProcessorImpl);

    dependencyManager = Sinon.createStubInstance(DefaultDependencyManager);
    loggerFactory = new TestLoggerFactory();
    appManager = ApplicationManager.Builder(TestClassMain)
      .withLoggerFactory(loggerFactory)
      .withDependencyManager(dependencyManager)
      .withServiceAnnotationClassProcessor(serviceAnnotationClassProcessor)
      .withFactoryAnnotationClassProcessor(factoryAnnotationClassProcessor)
      .withAutoScannerClassProvider(autoScannerClassProvider)
      .withClassProviders([classProvider1, classProvider2])
      .withClassProcessors(testClassProcessor)
      .build();
  });

  describe('#bootstrap()', function () {
    it('should register main class', async function () {
      // when
      await appManager.bootstrap();

      // then
      Sinon.assert.calledWith(<SinonStub>dependencyManager.service, {classz: TestClassMain, name: 'main'});
    });

    it('should use registered classProviders to find classes to be registered', async function () {
      // given
      let classInfo1: ClassInfo = {name: 'Class1', classz: Class1};
      let classInfo2: ClassInfo = {name: 'Class2', classz: Class2};
      (<SinonStub>classProvider1.provideClasses).returns(Promise.resolve([classInfo1]));
      (<SinonStub>classProvider2.provideClasses).returns(Promise.resolve([classInfo2]));

      // when
      await appManager.bootstrap();

      // then
      Sinon.assert.calledWith(<SinonStub>serviceAnnotationClassProcessor.processClass, TestClassMain, dependencyManager);
      Sinon.assert.calledWith(<SinonStub>serviceAnnotationClassProcessor.processClass, Class1, dependencyManager);
      Sinon.assert.calledWith(<SinonStub>serviceAnnotationClassProcessor.processClass, Class2, dependencyManager);
    });

    it('should call each class processor with all registered classes', async function () {
      // given
      let classInfo1: ClassInfo = {name: 'Class1', classz: Class1};
      let classInfo2: ClassInfo = {name: 'Class2', classz: Class2};
      (<SinonStub>classProvider1.provideClasses).returns(Promise.resolve([classInfo1]));
      (<SinonStub>classProvider2.provideClasses).returns(Promise.resolve([classInfo2]));

      // when
      await appManager.bootstrap();

      // then
      Sinon.assert.calledWith(<SinonStub>serviceAnnotationClassProcessor.processClass, Class1, dependencyManager);
      Sinon.assert.calledWith(<SinonStub>serviceAnnotationClassProcessor.processClass, Class2, dependencyManager);
      Sinon.assert.calledWith(<SinonStub>serviceAnnotationClassProcessor.processClass, TestClassMain, dependencyManager);
      Sinon.assert.calledWith(<SinonStub>factoryAnnotationClassProcessor.processClass, Class1, dependencyManager);
      Sinon.assert.calledWith(<SinonStub>factoryAnnotationClassProcessor.processClass, Class2, dependencyManager);
      Sinon.assert.calledWith(<SinonStub>factoryAnnotationClassProcessor.processClass, TestClassMain, dependencyManager);
      Sinon.assert.calledWith(<SinonStub>testClassProcessor.processClass, Class1, dependencyManager);
      Sinon.assert.calledWith(<SinonStub>testClassProcessor.processClass, Class2, dependencyManager);
      Sinon.assert.calledWith(<SinonStub>testClassProcessor.processClass, TestClassMain, dependencyManager);
    });

    it('should call onApplicationLoad on all class processors after resolving main class ', async function () {
      // when
      await appManager.bootstrap();

      // then
      let call1 = (<SinonStub>dependencyManager.findOne).withArgs('main');
      let call2 = <SinonStub>testClassProcessor.onApplicationLoad;
      Sinon.assert.callOrder(call1, call2);
      Sinon.assert.called(<SinonStub>serviceAnnotationClassProcessor.onApplicationLoad);
      Sinon.assert.called(<SinonStub>factoryAnnotationClassProcessor.onApplicationLoad);
      Sinon.assert.called(<SinonStub>testClassProcessor.onApplicationLoad);
    });

    it('should call class processors with services registered', async function () {
      // given
      await appManager.registerService({classz: Class1});

      // when
      await appManager.bootstrap();

      // then
      Sinon.assert.calledWith(<SinonStub>serviceAnnotationClassProcessor.processClass, Class1, dependencyManager);
      Sinon.assert.calledWith(<SinonStub>factoryAnnotationClassProcessor.processClass, Class1, dependencyManager);
      Sinon.assert.calledWith(<SinonStub>testClassProcessor.processClass, Class1, dependencyManager);
    });

  });

  describe('#registerService()', async function () {
    it('should register a service', async function () {
      // given
      let service = Sinon.stub();
      let serviceInfo = {classz: service, name: UNIT_NAME};

      // when
      await appManager.registerService(serviceInfo);

      // then
      Sinon.assert.calledWith(<SinonStub>dependencyManager.service, serviceInfo);
    });
  });

  describe('#registerFactory()', async function () {
    it('should register a factory', async function () {
      // given
      let factory = Sinon.stub();
      let dependencies = [];
      let factoryInfo = {factoryFn: factory, name: UNIT_NAME, context: Class1, dependencies: dependencies};

      // when
      await appManager.registerFactory(factoryInfo);

      // then
      Sinon.assert.calledWith(<SinonStub>dependencyManager.factory, factoryInfo);
    });
  });

  describe('#registerValue()', async function () {
    it('should register a value', async function () {
      // given
      let value = Sinon.stub();

      // when
      await appManager.registerValue(UNIT_NAME, value);

      // then
      Sinon.assert.calledWith(<SinonStub>dependencyManager.value, UNIT_NAME, value);
    });
  });

  class TestClassMain {
    id = 'MainClass';
  }

  class TestClassProviderImpl implements ClassProvider {
    provideClasses(): Promise<ClassInfo[]> {
      throw new Error("Method not implemented.");
    }
  }

  class TestClassProcessorImpl implements ClassProcessor {
    processClass(classz: Function, dependencyManager: DependencyManager): Promise<void> {
      throw new Error("Method not implemented.");
    }

    onApplicationLoad(dependencyManager: DependencyManager): Promise<void> {
      throw new Error("Method not implemented.");
    }
  }

  class Class1 {
    id: 'class1'
  }

  class Class2 {
    id: 'class2'
  }

  @Service('byString')
  class DependencyWithNameFromString {
  }

});