import {AutoScannerClassProvider} from "./autoScanner/AutoScannerClassProvider";
import {ApplicationModule} from "../ApplicationModule";
import {AutoScanOptions} from "./autoScanner/AutoScanOptions";
import {ObjectUtils} from "../ObjectUtils";
import {LoggerFactory} from "../logging/LoggerFactory";
import {ConsoleLoggerFactory} from "../logging/ConsoleLoggerFactory";
import {ClassProvider} from "./ClassProvider";
import {ClassProcessor} from "./ClassProcessor";
import {ClassInfo} from "../ClassInfo";
import {InjectableAnnotationClassProcessor} from "../..";
import {FactoryAnnotationClassProcessor} from "../di/factory/FactoryAnnotationClassProcessor";
import {DefaultDependencyManager} from "../di/DefaultDependencyManager";
import {DependencyManager} from "../di/DependencyManager";
import {ModuleContext} from "../ModuleContext";

export interface CoreModuleOptions {
  loggerFactory?: LoggerFactory;
  autoScannerClassProvider?: AutoScannerClassProvider;
  serviceAnnotationClassProcessor?: InjectableAnnotationClassProcessor;
  factoryAnnotationClassProcessor?: FactoryAnnotationClassProcessor;
  dependencyManager?: DependencyManager;
}

export class CoreModule implements ApplicationModule {
  private _loggerFactory: LoggerFactory;
  private _autoScannerClassProvider: AutoScannerClassProvider;
  private _classProcessors: ClassProcessor[];
  private _classProviders: ClassProvider[];
  public readonly dependencyManager: DependencyManager;

  constructor(options: CoreModuleOptions = {}) {
    let loggerFactory = options.loggerFactory || new ConsoleLoggerFactory();
    this._loggerFactory = loggerFactory;
    this._autoScannerClassProvider = options.autoScannerClassProvider;

    let dependencyManager = this.dependencyManager = options.dependencyManager || new DefaultDependencyManager({loggerFactory});
    let serviceAnnotationClassProcessor = options.serviceAnnotationClassProcessor || new InjectableAnnotationClassProcessor({
      dependencyManager,
      loggerFactory
    });
    let factoryAnnotationClassProcessor = options.factoryAnnotationClassProcessor || new FactoryAnnotationClassProcessor({
      dependencyManager,
      loggerFactory
    });

    this._classProcessors = [serviceAnnotationClassProcessor, factoryAnnotationClassProcessor];
    this._classProviders = [];

    if (this._autoScannerClassProvider) {
      this._classProviders.push(this._autoScannerClassProvider);
    }
  }

  public async initialize(application: ModuleContext): Promise<void> {
    let autoScanOptions: AutoScanOptions = ObjectUtils.getValue(application.applicationConfig, "nodeBoot.core.autoScan") || {};
    if (!this._autoScannerClassProvider) {
      this._autoScannerClassProvider = new AutoScannerClassProvider({
        autoScanOptions,
        loggerFactory: this._loggerFactory
      });
      this._classProviders.push(this._autoScannerClassProvider);
    }
    this.dependencyManager.value('applicationManager', application);
  }

  public async processClasses(classes: ClassInfo[]): Promise<void> {
    for (let classInfo of classes) {
      for (let processor of this._classProcessors) {
        await processor.processClass(classInfo.classz);
      }
    }
  }

  public async provideClasses(): Promise<ClassInfo[]> {
    let result: ClassInfo[] = [];
    for (let provider of this._classProviders) {
      result.push(...await provider.provideClasses());
    }
    return result;
  }

  public async applicationLoaded(): Promise<void> {
  }
}
