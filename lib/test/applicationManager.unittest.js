'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const sinon = require("sinon");
const chai = require("chai");
const applicationManager_1 = require("../main/applicationManager");
const loggerFactory_1 = require("../main/loggerFactory");
const defaultModuleScannerService_1 = require("../main/moduleScanner/defaultModuleScannerService");
const defaultDependencyInjector_1 = require("../main/dependencyInjector/defaultDependencyInjector");
const mvc_1 = require("../main/decorator/mvc");
const optional_1 = require("../main/optional");
const di_1 = require("../main/decorator/di");
const expressWebManager_1 = require("../main/webManager/expressWebManager");
const assert = chai.assert;
describe('ApplicationManager', function () {
    let appManager;
    let webManager;
    let moduleScannerService;
    let loggerFactory;
    let dependencyInjector;
    let byClassInstance;
    const UNIT_NAME = "test1";
    function spy() {
        return sinon.spy();
    }
    function stub() {
        return sinon.stub();
    }
    beforeEach(() => {
        webManager = sinon.createStubInstance(expressWebManager_1.ExpressWebManager);
        moduleScannerService = sinon.createStubInstance(defaultModuleScannerService_1.DefaultModuleScannerService);
        dependencyInjector = sinon.createStubInstance(defaultDependencyInjector_1.DefaultDependencyInjector);
        loggerFactory = sinon.createStubInstance(loggerFactory_1.LoggerFactory);
        loggerFactory.getLogger.returns(sinon.createStubInstance(loggerFactory_1.Logger));
        byClassInstance = new ByClass();
        appManager = new applicationManager_1.ApplicationManager(TestClassMain, webManager, loggerFactory, dependencyInjector, moduleScannerService);
    });
    describe('#bootstrap()', function () {
        it('should register classes annotated with @Service', function () {
            return __awaiter(this, void 0, void 0, function* () {
                dependencyInjectorIsEmpty();
                dependencyInjectorHasMainClassAsService();
                scannerReturnsTestClasses();
                yield appManager.bootstrap();
                assertServiceIsRegistered(ByClass, null);
                assertServiceIsRegistered(DependencyWithNameFromString, 'byString');
            });
        });
        it('should not register classes that are not annotated with @Service', function () {
            return __awaiter(this, void 0, void 0, function* () {
                dependencyInjectorIsEmpty();
                dependencyInjectorHasMainClassAsService();
                scannerReturnsTestClasses();
                yield appManager.bootstrap();
                assertServiceIsNotRegistered(DependencyClassNotService);
            });
        });
        it('should register functions annotated with @Producer as factories', function () {
            return __awaiter(this, void 0, void 0, function* () {
                dependencyInjectorIsEmpty();
                dependencyInjectorHasMainClassAsService();
                scannerReturnsTestClasses();
                yield appManager.bootstrap();
                assertFactoryIsRegistered('byFactory', TestClassMain.prototype.create);
            });
        });
        it('should certify that all dependencies were found', function () {
            return __awaiter(this, void 0, void 0, function* () {
                dependencyInjectorIsEmpty();
                dependencyInjectorHasMainClassAsService();
                scannerReturnsTestClasses();
                yield appManager.bootstrap();
                assertAllDependenciesWhereChecked();
            });
        });
        it('should register apis annotated with @RequestMapping', function () {
            return __awaiter(this, void 0, void 0, function* () {
                dependencyInjectorHasMainClassAsService();
                dependencyInjectorFindsController();
                scannerReturnsTestClasses();
                yield appManager.bootstrap();
                assertApiIsRegistered({
                    path: '/testApi-1',
                    type: mvc_1.RequestType.GET,
                    callback: sinon.match.any
                }, byClassInstance);
                assertApiIsRegistered({
                    path: '/testApi-2',
                    type: mvc_1.RequestType.POST,
                    callback: ByClass.prototype.testApiMethodWithoutResponseBody
                }, byClassInstance);
            });
        });
    });
    describe('#registerFactory()', function () {
        it('should register a factory', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let factoryFn = sinon.stub();
                yield appManager.registerFactory(UNIT_NAME, factoryFn);
                assert.isTrue(dependencyInjector.factory.calledWith(UNIT_NAME, factoryFn));
            });
        });
    });
    describe('#registerService()', function () {
        return __awaiter(this, void 0, void 0, function* () {
            it('should register a service', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    let service = sinon.stub();
                    yield appManager.registerService(service, UNIT_NAME);
                    assert.isTrue(dependencyInjector.service.calledWith(service, UNIT_NAME));
                });
            });
        });
    });
    describe('#registerValue()', function () {
        return __awaiter(this, void 0, void 0, function* () {
            it('should register a value', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    let value = sinon.stub();
                    yield appManager.registerValue(UNIT_NAME, value);
                    assert.isTrue(dependencyInjector.value.calledWith(UNIT_NAME, value));
                });
            });
        });
    });
    function classesInfo() {
        return [
            { name: 'TestClassMain', classz: TestClassMain },
            { name: 'ByClass', classz: ByClass },
            { name: 'DependencyWithNameFromString', classz: DependencyWithNameFromString },
            { name: 'DependencyClassNotService', classz: DependencyClassNotService }
        ];
    }
    function dependencyInjectorHasMainClassAsService() {
        dependencyInjector.findOne.withArgs(TestClassMain).returns(optional_1.Optional.of({}));
    }
    function assertApiIsRegistered(endpointInfo, instance) {
        assert.isTrue(webManager.registerApi.calledWith(endpointInfo, instance));
    }
    function assertAllDependenciesWhereChecked() {
        assert.isTrue(dependencyInjector.assertAllResolved.calledWith());
    }
    function dependencyInjectorIsEmpty() {
        dependencyInjector.findAll.returns([]);
    }
    function dependencyInjectorFindsController() {
        dependencyInjector.findAll.returns([{ name: 'byClass', value: byClassInstance, classz: ByClass }]);
    }
    function scannerReturnsTestClasses() {
        moduleScannerService.scan.withArgs(['i-path/'], ['e-path/']).returns(classesInfo());
    }
    function assertServiceIsNotRegistered(classz) {
        let serviceRegistered = dependencyInjector.service.calledWith(classz);
        assert.isFalse(serviceRegistered);
    }
    function assertServiceIsRegistered(classz, name) {
        let serviceRegistered = dependencyInjector.service.calledWith(classz, name);
        assert.isTrue(serviceRegistered);
    }
    function assertFactoryIsRegistered(target, factory) {
        let serviceRegistered = dependencyInjector.factory.calledWith(target, factory);
        assert.equal(serviceRegistered, serviceRegistered);
    }
    let TestClassMain = class TestClassMain {
        create() {
            return 10;
        }
    };
    __decorate([
        di_1.Factory('byFactory'), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', Object)
    ], TestClassMain.prototype, "create", null);
    TestClassMain = __decorate([
        di_1.AutoScan(['i-path/'], ['e-path/']), 
        __metadata('design:paramtypes', [])
    ], TestClassMain);
    let ByClass = class ByClass {
        testApiMethodWithResponseBody(request, response) {
            return 'test response';
        }
        testApiMethodWithoutResponseBody(request, response) {
            return 'test response';
        }
    };
    __decorate([
        mvc_1.ResponseBody,
        mvc_1.RequestMapping('/testApi-1', mvc_1.RequestType.GET), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object, Object]), 
        __metadata('design:returntype', void 0)
    ], ByClass.prototype, "testApiMethodWithResponseBody", null);
    __decorate([
        mvc_1.RequestMapping('/testApi-2', mvc_1.RequestType.POST), 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', [Object, Object]), 
        __metadata('design:returntype', void 0)
    ], ByClass.prototype, "testApiMethodWithoutResponseBody", null);
    ByClass = __decorate([
        di_1.Service, 
        __metadata('design:paramtypes', [])
    ], ByClass);
    let DependencyWithNameFromString = class DependencyWithNameFromString {
    };
    DependencyWithNameFromString = __decorate([
        di_1.Service('byString'), 
        __metadata('design:paramtypes', [])
    ], DependencyWithNameFromString);
    class DependencyClassNotService {
    }
});

//# sourceMappingURL=applicationManager.unittest.js.map
