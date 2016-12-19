"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
require("reflect-metadata");
const di_1 = require("./decorator/di");
const defaultDependencyInjector_1 = require("./dependencyInjector/defaultDependencyInjector");
const mvc_1 = require("./decorator/mvc");
const defaultModuleScannerService_1 = require("./moduleScanner/defaultModuleScannerService");
const loggerFactory_1 = require("./loggerFactory");
const objectUtils_1 = require("./objectUtils");
const sourceMapSupport = require("source-map-support");
sourceMapSupport.install();
class ApplicationManager {
    constructor(mainApplicationClass, webManager, loggerFactory, dependencyInjector, moduleScannerService) {
        this.mainApplicationClass = mainApplicationClass;
        this.webManager = webManager;
        this.loggerFactory = loggerFactory;
        this.dependencyInjector = dependencyInjector;
        this.moduleScannerService = moduleScannerService;
        this.loggerFactory = loggerFactory || new loggerFactory_1.LoggerFactory();
        this.logger = loggerFactory.getLogger('dependencyInjector');
        this.dependencyInjector = dependencyInjector || new defaultDependencyInjector_1.DefaultDependencyInjector(loggerFactory);
        this.moduleScannerService = moduleScannerService || new defaultModuleScannerService_1.DefaultModuleScannerService();
        this.dependencyInjector.value('applicationManager', this);
    }
    registerValue(name, value) {
        return this.dependencyInjector.value(name, value);
    }
    registerService(service, name) {
        return this.dependencyInjector.service(service, name);
    }
    registerFactory(name, factoryFn, holder) {
        return this.dependencyInjector.factory(name, factoryFn, holder);
    }
    bootstrap() {
        return __awaiter(this, void 0, void 0, function* () {
            this.dependencyInjector.service(this.mainApplicationClass);
            let autoScanInfo = di_1.DI.getAutoScanConfig(this.mainApplicationClass);
            if (autoScanInfo) {
                yield this.scanAndRegisterModules(autoScanInfo.includePaths, autoScanInfo.excludePaths);
            }
            this.dependencyInjector.assertAllResolved();
            yield this.registerEndpoints();
            return this.dependencyInjector.findOne(this.mainApplicationClass).get();
        });
    }
    scanAndRegisterModules(includePaths, excludePaths) {
        return __awaiter(this, void 0, void 0, function* () {
            let classesInfo = yield this.moduleScannerService.scan(includePaths, excludePaths);
            let registeredClasses = classesInfo.map(classInfo => this.registerClass(classInfo));
            yield Promise.all(registeredClasses);
        });
    }
    registerClass(classInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.debug(`Loading class ${classInfo.name}`);
            let declaredServices = di_1.DI.getDeclaredServices(classInfo.classz)
                .map((serviceInfo) => {
                this.logger.debug(`Registering scanned service for ${classInfo.name}: ${serviceInfo.name || objectUtils_1.ObjectUtils.extractClassName(serviceInfo.classz)}`);
                return this.registerService(serviceInfo.classz, serviceInfo.name);
            });
            yield Promise.all(declaredServices);
            let declaredFactories = di_1.DI.getDeclaredFactories(classInfo.classz)
                .map((factoryInfo) => {
                this.logger.debug(`Registering scanned factory for ${classInfo.name}: ${factoryInfo.name}`);
                return this.registerFactory(factoryInfo.name, factoryInfo.factory);
            });
            yield Promise.all(declaredFactories);
        });
    }
    registerEndpoints() {
        let self = this;
        if (!this.webManager) {
            throw new Error('No webmanager configured. Make sure you have given a webManager instance to the applicationManager constructor.');
        }
        this.dependencyInjector.findAll()
            .filter(unit => unit.classz)
            .forEach(unit => {
            let endpointsInfo = mvc_1.MVC.getEndpoints(unit.classz);
            endpointsInfo.forEach(endpointInfo => self.webManager.registerApi(endpointInfo, unit.value));
        });
    }
}
exports.ApplicationManager = ApplicationManager;

//# sourceMappingURL=applicationManager.js.map
