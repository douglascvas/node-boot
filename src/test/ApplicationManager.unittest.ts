'use strict';

import * as Sinon from "sinon";
import * as chai from "chai";
import {ApplicationManager} from "../main/ApplicationManager";
import {ModuleScannerService, ClassInfo} from "../main/moduleScanner/ModuleScannerService";
import {LoggerFactory} from "../main/LoggerFactory";
import {DependencyInjector} from "../main/dependencyInjector/DependencyInjector";
import {DefaultModuleScannerService} from "../main/moduleScanner/DefaultModuleScannerService";
import {DefaultDependencyInjector} from "../main/dependencyInjector/DefaultDependencyInjector";
import {RequestType, EndpointInfo, ResponseBody, RequestMapping} from "../main/decorator/Mvc";
import {Optional} from "../main/Optional";
import {AutoScan, Factory, Service} from "../main/decorator/Di";
import {WebManager} from "../main/webManager/WebManager";
import {ExpressWebManager} from "../main/webManager/ExpressWebManager";
import {TestLoggerFactory} from "./TestLoggerFactory";
import SinonSpy = Sinon.SinonSpy;
import SinonStub = Sinon.SinonStub;

const assert = chai.assert;

describe('ApplicationManager', function () {

  let appManager: ApplicationManager;
  let webManager: WebManager;
  let moduleScannerService: ModuleScannerService;
  let loggerFactory: LoggerFactory;
  let dependencyInjector: DependencyInjector;
  let byClassInstance: ByClass;
  const UNIT_NAME = "test1";


  function spy() {
    return Sinon.spy();
  }

  function stub() {
    return Sinon.stub();
  }

  beforeEach(() => {
    webManager = Sinon.createStubInstance(ExpressWebManager);
    moduleScannerService = Sinon.createStubInstance(DefaultModuleScannerService);
    dependencyInjector = Sinon.createStubInstance(DefaultDependencyInjector);
    loggerFactory = new TestLoggerFactory();
    byClassInstance = new ByClass();
    appManager = new ApplicationManager(TestClassMain, webManager, loggerFactory, dependencyInjector, moduleScannerService);
  });

  describe('#bootstrap()', function () {
    it('should register classes annotated with @Service', async function () {
      // given
      dependencyInjectorIsEmpty();
      dependencyInjectorHasMainClassAsService();
      scannerReturnsTestClasses();

      // when
      await appManager.bootstrap();

      // then
      assertServiceIsRegistered(ByClass, null);
      assertServiceIsRegistered(DependencyWithNameFromString, 'byString');
    });

    it('should not register classes that are not annotated with @Service', async function () {
      // given
      dependencyInjectorIsEmpty();
      dependencyInjectorHasMainClassAsService();
      scannerReturnsTestClasses();

      // when
      await appManager.bootstrap();

      // then
      assertServiceIsNotRegistered(DependencyClassNotService);
    });

    it('should register functions annotated with @Producer as factories', async function () {
      // given
      dependencyInjectorIsEmpty();
      dependencyInjectorHasMainClassAsService();
      scannerReturnsTestClasses();

      // when
      await appManager.bootstrap();

      // then
      assertFactoryIsRegistered('byFactory', TestClassMain.prototype.create);
    });

    it('should certify that all dependencies were found', async function () {
      // given
      dependencyInjectorIsEmpty();
      dependencyInjectorHasMainClassAsService();
      scannerReturnsTestClasses();

      // when
      await appManager.bootstrap();

      // then
      assertAllDependenciesWhereChecked();
    });

    it('should register apis annotated with @RequestMapping', async function () {
      // given
      dependencyInjectorHasMainClassAsService();
      dependencyInjectorFindsController();
      scannerReturnsTestClasses();

      // when
      await appManager.bootstrap();

      // then
      assertApiIsRegistered({
        path: '/testApi-1',
        type: RequestType.GET,
        callback: <any>Sinon.match.any
      }, byClassInstance);

      assertApiIsRegistered({
        path: '/testApi-2',
        type: RequestType.POST,
        callback: ByClass.prototype.testApiMethodWithoutResponseBody
      }, byClassInstance);
    });

  });

  describe('#registerFactory()', function () {
    it('should register a factory', async function () {
      // given
      let factoryFn = Sinon.stub();

      // when
      await appManager.registerFactory(UNIT_NAME, factoryFn);

      assert.isTrue((<SinonStub>dependencyInjector.factory).calledWith(UNIT_NAME, factoryFn));
    });
  });

  describe('#registerService()', async function () {
    it('should register a service', async function () {
      // given
      let service = Sinon.stub();

      // when
      await appManager.registerService(service, UNIT_NAME);

      assert.isTrue((<SinonStub>dependencyInjector.service).calledWith(service, UNIT_NAME));
    });
  });

  describe('#registerValue()', async function () {
    it('should register a value', async function () {
      // given
      let value = Sinon.stub();

      // when
      await appManager.registerValue(UNIT_NAME, value);

      assert.isTrue((<SinonStub>dependencyInjector.value).calledWith(UNIT_NAME, value));
    });
  });

  function classesInfo(): ClassInfo[] {
    return [
      {name: 'TestClassMain', classz: TestClassMain},
      {name: 'ByClass', classz: ByClass},
      {name: 'DependencyWithNameFromString', classz: DependencyWithNameFromString},
      {name: 'DependencyClassNotService', classz: DependencyClassNotService}
    ];
  }

  function dependencyInjectorHasMainClassAsService() {
    (<SinonStub>dependencyInjector.findOne).withArgs(TestClassMain).returns(Optional.of({}));
  }

  function assertApiIsRegistered(endpointInfo: EndpointInfo, instance: any) {
    assert.isTrue((<SinonStub>webManager.registerApi).calledWith(endpointInfo, instance));
  }

  function assertAllDependenciesWhereChecked() {
    assert.isTrue((<SinonStub>dependencyInjector.assertAllResolved).calledWith());
  }

  function dependencyInjectorIsEmpty() {
    (<SinonStub>dependencyInjector.findAll).returns([]);
  }

  function dependencyInjectorFindsController() {
    (<SinonStub>dependencyInjector.findAll).returns([{name: 'byClass', value: byClassInstance, classz: ByClass}]);
  }

  function scannerReturnsTestClasses() {
    (<SinonStub>moduleScannerService.scan).withArgs(['i-path/'], ['e-path/']).returns(classesInfo());
  }

  function assertServiceIsNotRegistered(classz: Function) {
    let serviceRegistered = (<SinonStub>dependencyInjector.service).calledWith(classz);
    assert.isFalse(serviceRegistered);
  }

  function assertServiceIsRegistered(classz: Function, name?: string) {
    let serviceRegistered = (<SinonStub>dependencyInjector.service).calledWith(classz, name);
    assert.isTrue(serviceRegistered);
  }

  function assertFactoryIsRegistered(target: any, factory: Function) {
    let serviceRegistered = (<SinonStub>dependencyInjector.factory).calledWith(target, factory);
    assert.equal(serviceRegistered, serviceRegistered);
  }

  @AutoScan(['i-path/'], ['e-path/'])
  class TestClassMain {
    @Factory('byFactory')
    public create(): any {
      return 10;
    }
  }

  @Service
  class ByClass {
    @ResponseBody
    @RequestMapping('/testApi-1', RequestType.GET)
    public testApiMethodWithResponseBody(request, response) {
      return 'test response';
    }

    @RequestMapping('/testApi-2', RequestType.POST)
    public testApiMethodWithoutResponseBody(request, response) {
      return 'test response';
    }
  }

  @Service('byString')
  class DependencyWithNameFromString {
  }

  class DependencyClassNotService {
  }

});