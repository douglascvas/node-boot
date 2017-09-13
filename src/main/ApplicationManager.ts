import * as sourceMapSupport from "source-map-support";
import {ClassProcessor} from "./core/ClassProcessor";
import {LoggerFactory} from "./logging/LoggerFactory";
import {DependencyManager} from "./dependencyManager/DependencyManager";
import {ConsoleLoggerFactory} from "./logging/ConsoleLoggerFactory";
import {Logger} from "./logging/Logger";
import {DefaultDependencyManager} from "./dependencyManager/DefaultDependencyManager";
import * as assert from "assert";
import {ClassProvider} from "./core/ClassProvider";
import {ClassInfo} from "./ClassInfo";
import {AutoScanOptions} from "./core/autoScanner/AutoScanOptions";
import {ServiceAnnotationClassProcessor} from "./dependencyManager/service/ServiceAnnotationClassProcessor";
import {FactoryAnnotationClassProcessor} from "./dependencyManager/factory/FactoryAnnotationClassProcessor";
import {AutoScannerClassProvider} from "./core/autoScanner/AutoScannerClassProvider";
import {ServiceInfo} from "./dependencyManager/service/ServiceInfo";
import {FactoryInfo} from "./dependencyManager/factory/FactoryInfo";
import {ServiceHelper} from "./dependencyManager/service/Service";

sourceMapSupport.install();

export class ApplicationManager {

  private _logger: Logger;
  private _classProcessors: Set<ClassProcessor>;
  private _mainApplicationClass: any;
  private _mainApplicationInstance: any;
  private _dependencyManager: DependencyManager;
  private _classProviders: Set<ClassProvider>;
  private _autoScanEnabled: boolean;
  private _registeredClasses: Set<Function>;
  private _autoScannerClassProvider: AutoScannerClassProvider;

  constructor(builder: ApplicationManagerBuilder) {
    assert(builder.mainApplicationClass, "mainApplicationClass is required");

    let loggerFactory: LoggerFactory = builder.loggerFactory || new ConsoleLoggerFactory();
    let serviceAnnotationClassProcessor = builder.serviceAnnotationClassProcessor ||
      ServiceAnnotationClassProcessor.Builder().withLoggerFactory(builder.loggerFactory)
        .build();
    let factoryAnnotationClassProcessor = builder.factoryAnnotationClassProcessor ||
      FactoryAnnotationClassProcessor.Builder().withLoggerFactory(builder.loggerFactory)
        .build();

    this._logger = loggerFactory.getLogger(ApplicationManager);
    this._autoScanEnabled = !!builder.autoScanOptions;
    this._mainApplicationClass = builder.mainApplicationClass;
    this._autoScannerClassProvider = builder.autoScannerClassProvider || AutoScannerClassProvider.Builder(builder.autoScanOptions)
      .withLoggerFactory(loggerFactory)
      .build();

    this._dependencyManager = builder.dependencyManager || DefaultDependencyManager.Builder()
      .withLoggerFactory(loggerFactory)
      .build();

    this._dependencyManager.value('applicationManager', this);

    this._registeredClasses = new Set();
    this._classProcessors = new Set(builder.classProcessors || []);
    this._classProcessors.add(serviceAnnotationClassProcessor);
    this._classProcessors.add(factoryAnnotationClassProcessor);

    this._classProviders = new Set(builder.classProviders || []);
    this.useAutoScanIfEnabled(loggerFactory);
  }

  public async registerService(serviceInfo: ServiceInfo | Function): Promise<void> {
    let info: ServiceInfo;
    if (serviceInfo instanceof Function) {
      info = ServiceHelper.getDeclaredService(serviceInfo) || {classz: serviceInfo};
    } else {
      info = serviceInfo;
    }
    this._registeredClasses.add(info.classz);
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


  /**
   * This method must be called after everything is registered,
   * to start the application management by the framework.
   *
   * @return Returns the instance of the main application class.
   */
  public async bootstrap(): Promise<any> {
    if (this._mainApplicationInstance) {
      return this._mainApplicationInstance;
    }

    await this.registerService({classz: this._mainApplicationClass, name: 'main'});
    await this.findClassesToBeRegistered();

    for (let classz of this._registeredClasses) {
      for (let classProcessor of this._classProcessors) {
        await classProcessor.processClass(classz, this._dependencyManager)
      }
    }

    let mainApplication = await this._dependencyManager.findOne('main');

    for (let classProcessor of this._classProcessors) {
      await classProcessor.onApplicationLoad(this._dependencyManager);
    }
    this._mainApplicationInstance = mainApplication;
    return this._mainApplicationInstance;
  }

  private async findClassesToBeRegistered(): Promise<void> {
    let classInfoBlocks: ClassInfo[][] = await Promise.all(Array.from(this._classProviders)
      .map(cf => cf.provideClasses()).filter(v => !!v));
    let classesInfo = this.flattenArray(classInfoBlocks);
    classesInfo.forEach(classInfo => this._registeredClasses.add(classInfo.classz));
  }

  private flattenArray(classInfoBlocks: ClassInfo[][]): ClassInfo[] {
    return classInfoBlocks.reduce((previous, current) => [...previous, ...current], []);
  }

  private useAutoScanIfEnabled(loggerFactory: LoggerFactory) {
    if (this._autoScanEnabled) {
      this._classProviders.add(this._autoScannerClassProvider)
    }
  }

  public static Builder(mainApplicationClass: Function): ApplicationManagerBuilder {
    return new ApplicationManagerBuilder(mainApplicationClass);
  }

}

export class ApplicationManagerBuilder {
  private _classProcessors: ClassProcessor[];
  private _autoScannerClassProvider: AutoScannerClassProvider;
  private _factoryAnnotationClassProcessor: FactoryAnnotationClassProcessor;
  private _serviceAnnotationClassProcessor: ServiceAnnotationClassProcessor;
  private _dependencyManager: DependencyManager;
  private _loggerFactory: LoggerFactory;
  private _classProviders: ClassProvider[];
  private _autoScanOptions: AutoScanOptions;

  constructor(private _mainApplicationClass: Function) {
  }

  public build(): ApplicationManager {
    return new ApplicationManager(this);
  }

  public withClassProviders(value: ClassProvider | ClassProvider[]): ApplicationManagerBuilder {
    if (!(value instanceof Array)) {
      value = [value];
    }
    this._classProviders = [...value];
    return this;
  }

  public withClassProcessors(value: ClassProcessor | ClassProcessor[]): ApplicationManagerBuilder {
    if (!(value instanceof Array)) {
      value = [value];
    }
    this._classProcessors = [...value];
    return this;
  }

  public withServiceAnnotationClassProcessor(factory: ServiceAnnotationClassProcessor): ApplicationManagerBuilder {
    this._serviceAnnotationClassProcessor = factory;
    return this;
  }

  public withFactoryAnnotationClassProcessor(factory: FactoryAnnotationClassProcessor): ApplicationManagerBuilder {
    this._factoryAnnotationClassProcessor = factory;
    return this;
  }

  public withLoggerFactory(value: LoggerFactory): ApplicationManagerBuilder {
    this._loggerFactory = value;
    return this;
  }

  public withDependencyManager(value: DependencyManager): ApplicationManagerBuilder {
    this._dependencyManager = value;
    return this;
  }

  public withAutoScan(include: string | string[], exclude?: string | string[]): ApplicationManagerBuilder {
    if (typeof include === 'string') {
      include = [include];
    }
    if (typeof exclude === 'string') {
      exclude = [exclude];
    }
    this._autoScanOptions = {
      include: include,
      exclude: exclude
    };
    return this;
  }

  public withAutoScannerClassProvider(provider: AutoScannerClassProvider): ApplicationManagerBuilder {
    this._autoScannerClassProvider = provider;
    return this;
  }

  get dependencyManager(): DependencyManager {
    return this._dependencyManager;
  }

  get loggerFactory(): LoggerFactory {
    return this._loggerFactory;
  }

  get mainApplicationClass(): any {
    return this._mainApplicationClass;
  }

  get classProviders(): ClassProvider[] {
    return this._classProviders;
  }

  get autoScanOptions(): AutoScanOptions {
    return this._autoScanOptions;
  }

  get factoryAnnotationClassProcessor(): FactoryAnnotationClassProcessor {
    return this._factoryAnnotationClassProcessor;
  }

  get serviceAnnotationClassProcessor(): ServiceAnnotationClassProcessor {
    return this._serviceAnnotationClassProcessor;
  }

  get autoScannerClassProvider(): AutoScannerClassProvider {
    return this._autoScannerClassProvider;
  }

  get classProcessors(): ClassProcessor[] {
    return this._classProcessors;
  }
}