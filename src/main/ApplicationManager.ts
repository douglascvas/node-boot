import "reflect-metadata";
import {DI, ServiceInfo, FactoryInfo, AutoScanInfo} from "./decorator/Di";
import {DefaultDependencyInjector} from "./dependencyInjector/DefaultDependencyInjector";
import {MVC, EndpointInfo} from "./decorator/Mvc";
import {ModuleScannerService, ClassInfo} from "./moduleScanner/ModuleScannerService";
import {DefaultModuleScannerService} from "./moduleScanner/DefaultModuleScannerService";
import {DependencyInjector} from "./dependencyInjector/DependencyInjector";
import {LoggerFactory} from "./LoggerFactory";
import {ObjectUtils} from "./ObjectUtils";
import {WebManager} from "./webManager/WebManager";
import * as sourceMapSupport from "source-map-support";
import {Logger} from "./Logger";
import {ConsoleLoggerFactory} from "./ConsoleLoggerFactory";

sourceMapSupport.install();

export class ApplicationManager {
  private logger: Logger;

  constructor(private mainApplicationClass: any,
              private webManager?: WebManager,
              private loggerFactory?: LoggerFactory,
              private dependencyInjector?: DependencyInjector,
              private moduleScannerService?: ModuleScannerService) {
    this.loggerFactory = loggerFactory || new ConsoleLoggerFactory();
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

  public registerFactory(name: string|Function, factoryFn: Function, holder?: any): Promise<boolean> {
    return this.dependencyInjector.factory(name, factoryFn, holder);
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
    if (!this.webManager) {
      throw new Error('No webmanager configured. Make sure you have given a webManager instance to the applicationManager constructor.');
    }
    this.dependencyInjector.findAll()
      .filter(unit => unit.classz)
      .forEach(unit => {
        let endpointsInfo: EndpointInfo[] = MVC.getEndpoints(unit.classz);
        endpointsInfo.forEach(endpointInfo => self.webManager.registerApi(endpointInfo, unit.value));
      });
  }

}