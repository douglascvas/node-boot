import * as sourceMapSupport from "source-map-support";
import {LoggerFactory} from "./logging/LoggerFactory";
import {DependencyManager} from "./di/DependencyManager";
import {ConsoleLoggerFactory} from "./logging/ConsoleLoggerFactory";
import {Logger} from "./logging/Logger";
import * as assert from "assert";
import {ClassInfo} from "./ClassInfo";
import {InjectableInfo} from "./di/injectable/InjectableInfo";
import {FactoryInfo} from "./di/factory/FactoryInfo";
import {ClassType} from "./ClassType";
import {ApplicationModule} from "./ApplicationModule";
import {DependencyInjectionModule} from "./di/DependencyInjectionModule";
import {CoreModule} from "./core/CoreModule";
import {ApplicationContext} from "./ApplicationContext";
import {ModuleContext} from "./ModuleContext";
import {InjectableAnnotation} from "./di/injectable/InjectableAnnotation";

sourceMapSupport.install();

export interface NodeBootApplicationOptions {
  mainApplicationClass: ClassType,
  loggerFactory?: LoggerFactory,
  applicationConfig?: Object,
  dependencyInjectionModule?: DependencyInjectionModule,
  coreModule?: CoreModule
}

export type FactoryParam = FactoryInfo | Function;
export type ServiceParam = InjectableInfo | Function;

export class NodeBootApplication {

  private _logger: Logger;
  private _loggerFactory: LoggerFactory;
  private _mainApplicationClass: ClassType;
  private _mainApplicationInstance: any;
  private _applicationConfig: Object;
  private _applicationModules: Set<ApplicationModule>;
  private _registeredClasses: Set<ClassInfo>;
  private _dependencyManager: DependencyManager;

  constructor(options: NodeBootApplicationOptions) {
    let loggerFactory: LoggerFactory = options.loggerFactory || new ConsoleLoggerFactory();

    this._mainApplicationClass = options.mainApplicationClass;
    assert(this._mainApplicationClass, "mainApplicationClass is required");

    this._logger = loggerFactory.getLogger(NodeBootApplication);
    this._loggerFactory = loggerFactory;
    this._applicationConfig = options.applicationConfig || {};
    this._registeredClasses = new Set();
    this._applicationModules = new Set();

    let coreModule: CoreModule = options.coreModule || new CoreModule({loggerFactory: loggerFactory});
    this._dependencyManager = coreModule.dependencyManager;
    this._applicationModules.add(coreModule);
  }

  public async registerService(...serviceInfo: ServiceParam[]): Promise<void> {
    for (let service of serviceInfo) {
      let info: InjectableInfo;
      if (service instanceof Function) {
        let serviceAnnotation: InjectableAnnotation = <InjectableAnnotation>InjectableAnnotation.getClassAnnotationsFrom(<any>service)[0];
        info = serviceAnnotation ? serviceAnnotation.injectableInfo : {classz: <any>service};
      } else {
        info = service;
      }
      this._registeredClasses.add({name: info.name, classz: info.classz});
      await this._dependencyManager.injectable(info);
    }
  }

  public async registerFactory(...factoryInfo: FactoryParam[]): Promise<void> {
    for (let factory of factoryInfo) {
      let info: FactoryInfo;
      if (factory instanceof Function) {
        info = {factoryFn: factory};
      } else {
        info = factory;
      }
      await this._dependencyManager.factory(info);
    }
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

  public usingModule(...module: ApplicationModule[]): this {
    [...module].forEach(m => this._applicationModules.add(m));
    return this;
  }


  // @deprecated - Kept for compatibility
  public async bootstrap(): Promise<any> {
    return this.run();
  }

  /**
   * This method must be called after everything is registered,
   * to start the application management by the framework.
   *
   * @return Returns the instance of the main application class.
   */
  public async run(): Promise<ApplicationContext> {
    if (this._mainApplicationInstance) {
      return this._mainApplicationInstance;
    }

    await this.initializeModules();

    await this.registerService({classz: this._mainApplicationClass, name: '$__main'});

    await this.loadAndProcessClasses();

    this._mainApplicationInstance = await this.initializeApplication();
    await this.triggerApplicationLoadedEvent();

    return {
      applicationConfig: this._applicationConfig,
      dependencyManager: this._dependencyManager,
      mainApplicationInstance: this._mainApplicationInstance
    };
  }

  private async initializeApplication(): Promise<void> {
    return await this._dependencyManager.findOne('$__main');
  }

  private async loadAndProcessClasses(): Promise<void> {
    let classes: ClassInfo[] = [...this._registeredClasses];
    for (let module of this._applicationModules) {
      classes.push(...(await module.provideClasses() || []));
    }
    for (let module of this._applicationModules) {
      await module.processClasses(classes);
    }
  }

  private async initializeModules(): Promise<void> {
    let moduleContext: ModuleContext = {
      applicationConfig: this._applicationConfig,
      dependencyManager: this._dependencyManager,
      mainApplicationClass: this._mainApplicationClass
    };
    for (let module of this._applicationModules) {
      await module.initialize(moduleContext);
    }
  }

  private async triggerApplicationLoadedEvent(): Promise<void> {
    for (let module of this._applicationModules) {
      await module.applicationLoaded();
    }
  }
}
