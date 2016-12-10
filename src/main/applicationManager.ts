import "reflect-metadata";
import {DI, ServiceInfo, FactoryInfo, AutoScanInfo} from "./decorator/di";
import {DefaultDependencyInjector} from "./dependencyInjector/defaultDependencyInjector";
import {MVC, EndpointInfo} from "./decorator/mvc";
import {RouteManager} from "./routeManager/routeManager";
import {ModuleScannerService, ClassInfo} from "./moduleScanner/moduleScannerService";
import {DefaultModuleScannerService} from "./moduleScanner/defaultModuleScannerService";
import {DependencyInjector} from "./dependencyInjector/dependencyInjector";
import {Logger, LoggerFactory} from "./loggerFactory";
import {ObjectUtils} from "./objectUtils";
import * as sourceMapSupport from "source-map-support";

sourceMapSupport.install();

export class ApplicationManager {
  private logger: Logger;

  constructor(private mainApplicationClass: any,
              private routeManager?: RouteManager,
              private loggerFactory?: LoggerFactory,
              private dependencyInjector?: DependencyInjector,
              private moduleScannerService?: ModuleScannerService) {
    this.loggerFactory = loggerFactory || new LoggerFactory();
    this.logger = loggerFactory.getLogger('dependencyInjector');
    this.dependencyInjector = dependencyInjector || new DefaultDependencyInjector(loggerFactory);
    this.moduleScannerService = moduleScannerService || new DefaultModuleScannerService();
    this.dependencyInjector.value('applicationManager', this);
  }

  public registerValue(name: string, value: any): Promise<void> {
    return this.dependencyInjector.value(name, value);
  }

  public registerService(service: Function, name?: string): Promise<boolean> {
    return this.dependencyInjector.service(service, name);
  }

  public registerFactory(target: any, factoryFn: Function): Promise<boolean> {
    return this.dependencyInjector.factory(target, factoryFn);
  }

  public async bootstrap(): Promise<any> {
    this.dependencyInjector.service(this.mainApplicationClass);
    let autoScanInfo: AutoScanInfo = DI.getAutoScanConfig(this.mainApplicationClass);
    if (autoScanInfo) {
      await this.scanAndRegisterModules(autoScanInfo.includePaths, autoScanInfo.excludePaths);
    }
    this.dependencyInjector.assertAllResolved();
    await this.registerEndpoints();
    return this.dependencyInjector.findOne(this.mainApplicationClass).get();
  }

  private async scanAndRegisterModules(includePaths?: string[], excludePaths?: string[]): Promise<void> {
    let classesInfo: ClassInfo[] = await this.moduleScannerService.scan(includePaths, excludePaths);
    let registeredClasses: Promise<void>[] = classesInfo.map(classInfo => this.registerClass(classInfo));
    await Promise.all(registeredClasses);
  }

  private async registerClass(classInfo: ClassInfo): Promise<void> {
    this.logger.debug(`Loading class ${classInfo.name}`);

    let declaredServices: Promise<boolean>[] = DI.getDeclaredServices(classInfo.classz)
      .map((serviceInfo: ServiceInfo) => {
        this.logger.debug(`Registering scanned service for ${classInfo.name}: ${serviceInfo.name || ObjectUtils.extractClassName(serviceInfo.classz)}`);
        return this.registerService(serviceInfo.classz, serviceInfo.name)
      });
    await Promise.all(declaredServices);

    let declaredFactories: Promise<boolean>[] = DI.getDeclaredFactories(classInfo.classz)
      .map((factoryInfo: FactoryInfo) => {
        this.logger.debug(`Registering scanned factory for ${classInfo.name}: ${factoryInfo.name}`);
        return this.registerFactory(factoryInfo.name, factoryInfo.factory);
      });
    await Promise.all(declaredFactories);
  }

  private registerEndpoints() {
    let self = this;
    this.dependencyInjector.findAll()
      .filter(unit => unit.classz)
      .forEach(unit => {
        let endpointsInfo: EndpointInfo[] = MVC.getEndpoints(unit.classz);
        endpointsInfo.forEach(endpointInfo => self.routeManager.registerApi(endpointInfo, unit.value));
      });
  }

}