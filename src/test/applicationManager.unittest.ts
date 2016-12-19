'use strict';

import * as sinon from "sinon";
import * as chai from "chai";
import {ApplicationManager} from "../main/applicationManager";
import {ModuleScannerService, ClassInfo} from "../main/moduleScanner/moduleScannerService";
import {LoggerFactory, Logger} from "../main/loggerFactory";
import {DependencyInjector} from "../main/dependencyInjector/dependencyInjector";
import {DefaultModuleScannerService} from "../main/moduleScanner/defaultModuleScannerService";
import {DefaultDependencyInjector} from "../main/dependencyInjector/defaultDependencyInjector";
import {RequestType, EndpointInfo, ResponseBody, RequestMapping} from "../main/decorator/mvc";
import {Optional} from "../main/optional";
import {AutoScan, Factory, Service} from "../main/decorator/di";
import {WebManager} from "../main/webManager/webManager";
import {ExpressWebManager} from "../main/webManager/expressWebManager";
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
    return sinon.spy();
  }

  function stub() {
    return sinon.stub();
  }

  beforeEach(() => {
    webManager = <any>sinon.createStubInstance(ExpressWebManager);
    moduleScannerService = <any>sinon.createStubInstance(DefaultModuleScannerService);
    dependencyInjector = <any>sinon.createStubInstance(DefaultDependencyInjector);
    loggerFactory = <any>sinon.createStubInstance(LoggerFactory);
    (<SinonStub>loggerFactory.getLogger).returns(sinon.createStubInstance(Logger));
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
        callback: <any>sinon.match.any
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
      let factoryFn = sinon.stub();

      // when
      await appManager.registerFactory(UNIT_NAME, factoryFn);

      assert.isTrue((<SinonStub>dependencyInjector.factory).calledWith(UNIT_NAME, factoryFn));
    });
  });

  describe('#registerService()', async function () {
    it('should register a service', async function () {
      // given
      let service = sinon.stub();

      // when
      await appManager.registerService(service, UNIT_NAME);

      assert.isTrue((<SinonStub>dependencyInjector.service).calledWith(service, UNIT_NAME));
    });
  });

  describe('#registerValue()', async function () {
    it('should register a value', async function () {
      // given
      let value = sinon.stub();

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