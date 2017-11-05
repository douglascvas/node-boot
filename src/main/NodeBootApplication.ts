import * as sourceMapSupport from "source-map-support";
import {ClassProcessor} from "./core/ClassProcessor";
import {LoggerFactory} from "./logging/LoggerFactory";
import {DependencyManager} from "./di/DependencyManager";
import {ConsoleLoggerFactory} from "./logging/ConsoleLoggerFactory";
import {Logger} from "./logging/Logger";
import * as assert from "assert";
import {ClassProvider} from "./core/ClassProvider";
import {ClassInfo} from "./ClassInfo";
import {ServiceInfo} from "./di/service/ServiceInfo";
import {FactoryInfo} from "./di/factory/FactoryInfo";
import {ClassType} from "./ClassType";
import {ServiceAnnotation} from "./di/service/ServiceAnnotation";
import {ClassProviderManager} from "./ClassProviderManager";
import {ClassProcessorManager} from "./ClassProcessorManager";
import {ApplicationManager} from "./ApplicationManager";
import {ApplicationModule} from "./ApplicationModule";
import {DependencyInjectionModule} from "./di/DependencyInjectionModule";
import {CoreModule} from "./core/CoreModule";
import {NodeBootDiModule} from "./di/NodeBootDiModule";

sourceMapSupport.install();

export interface NodeBootApplicationOptions {
  mainApplicationClass: ClassType,
  loggerFactory?: LoggerFactory,
  applicationConfig?: Object,
  classProviderManager?: ClassProviderManager,
  classProcessorManager?: ClassProcessorManager,
  dependencyInjectionModule?: DependencyInjectionModule,
  coreModule?: ApplicationModule
}

export class NodeBootApplication implements ApplicationManager {

  private _logger: Logger;
  private _loggerFactory: LoggerFactory;
  private _mainApplicationClass: ClassType;
  private _mainApplicationInstance: any;
  private _applicationConfig: Object;
  private _applicationModules: Set<ApplicationModule>;
  private _registeredClasses: Set<ClassInfo>;
  private _dependencyManager: DependencyManager;

  private _classProviderManager: ClassProviderManager;
  private _classProcessorManager: ClassProcessorManager;

  constructor(options: NodeBootApplicationOptions) {
    let loggerFactory: LoggerFactory = options.loggerFactory || new ConsoleLoggerFactory();

    this._mainApplicationClass = options.mainApplicationClass;
    assert(this._mainApplicationClass, "mainApplicationClass is required");

    this._logger = loggerFactory.getLogger(NodeBootApplication);
    this._loggerFactory = loggerFactory;
    this._applicationConfig = options.applicationConfig || {};
    this._classProviderManager = options.classProviderManager || new ClassProviderManager();
    this._classProcessorManager = options.classProcessorManager || new ClassProcessorManager();
    this._registeredClasses = new Set();
    this._applicationModules = new Set();

    let coreModule: ApplicationModule = options.coreModule || new CoreModule({loggerFactory: loggerFactory});
    this._applicationModules.add(coreModule);

    let dependencyInjectionModule: DependencyInjectionModule = options.dependencyInjectionModule || new NodeBootDiModule({loggerFactory});
    this._applicationModules.add(dependencyInjectionModule);

    this._dependencyManager = dependencyInjectionModule.dependencyManager;
  }

  public getDependencyManager(): DependencyManager {
    return this._dependencyManager;
  }

  public getMainApplicationClass(): ClassType {
    return this._mainApplicationClass;
  }

  public getApplicationConfig(): Object {
    return this._applicationConfig;
  }

  public async registerClassProcessor(...classProcessor: ClassProcessor[]) {
    this._classProcessorManager.registerClassProcessor(...classProcessor);
  }

  public async registerClassProvider(...classProvider: ClassProvider[]) {
    this._classProviderManager.registerClassProvider(...classProvider);
  }

  public async registerService(serviceInfo: ServiceInfo | ClassType): Promise<void> {
    let info: ServiceInfo;
    if (serviceInfo instanceof Function) {
      let serviceAnnotation: ServiceAnnotation = <ServiceAnnotation>ServiceAnnotation.getClassAnnotationsFrom(serviceInfo)[0];
      info = serviceAnnotation ? serviceAnnotation.serviceInfo : {classz: serviceInfo};
    } else {
      info = serviceInfo;
    }
    this._registeredClasses.add({name: info.name, classz: info.classz});
    await this._dependencyManager.service(info);
  }

  public async registerFactory(factoryInfo: FactoryInfo | Function): Promise<void> {
    let info: FactoryInfo;
    if (factoryInfo instanceof Function) {
      info = {factoryFn: factoryInfo};
    } else {
      info = factoryInfo;
    }
    await this._dependencyManager.factory(info);
  }

  /**
   * Registers a static value to be managed by the framework.
   *
   * @param {string} name Name of the value to be registered.
   * @param value {any} Value to be registered.
   * @returns {Promise<void>}
   */
  public async registerValue(name: string, value: any): Promise<void> {
    await this._dependencyManager.value(name, value);
  }

  public useModule(...module: ApplicationModule[]): this {
    [...module].forEach(m => this._applicationModules.add(m));
    return this;
  }


  // Kept for compatibility
  public async bootstrap(): Promise<any> {
    return this.run();
  }

  /**
   * This method must be called after everything is registered,
   * to start the application management by the framework.
   *
   * @return Returns the instance of the main application class.
   */
  public async run(): Promise<any> {
    if (this._mainApplicationInstance) {
      return this._mainApplicationInstance;
    }

    for (let module of this._applicationModules) {
      await module.initialize(this);
    }

    await this.registerService({classz: this._mainApplicationClass, name: '$__main'});

    let classes: ClassInfo[] = [...await this._classProviderManager.provideClasses(), ...this._registeredClasses];
    await this._classProcessorManager.processClasses(classes);

    let mainApplication = await this._dependencyManager.findOne('$__main');
    await this._classProcessorManager.triggerApplicationLoaded();

    this._mainApplicationInstance = mainApplication;
    return this._mainApplicationInstance;
  }
}
