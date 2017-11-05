import {ServiceAnnotationClassProcessor} from "./service/ServiceAnnotationClassProcessor";
import {FactoryAnnotationClassProcessor} from "./factory/FactoryAnnotationClassProcessor";
import {LoggerFactory} from "../logging/LoggerFactory";
import {DefaultDependencyManager} from "./DefaultDependencyManager";
import {ConsoleLoggerFactory} from "../logging/ConsoleLoggerFactory";
import {DependencyManager} from "./DependencyManager";
import {ApplicationManager} from "../ApplicationManager";
import {ClassProcessor} from "../core/ClassProcessor";
import {DependencyInjectionModule} from "./DependencyInjectionModule";

export interface NodeBootDiModuleOptions {
  loggerFactory?: LoggerFactory;
  dependencyManager?: DependencyManager;
}

export class NodeBootDiModule implements DependencyInjectionModule {
  private _dependencyManager: DependencyManager;
  private _classProcessors: ClassProcessor[];

  constructor(options: NodeBootDiModuleOptions = {}) {
    let loggerFactory: LoggerFactory = options.loggerFactory || new ConsoleLoggerFactory();
    let dependencyManager = this._dependencyManager = options.dependencyManager || new DefaultDependencyManager({loggerFactory: loggerFactory});

    let serviceAnnotationClassProcessor = new ServiceAnnotationClassProcessor({dependencyManager, loggerFactory});
    let factoryAnnotationClassProcessor = new FactoryAnnotationClassProcessor({dependencyManager, loggerFactory});

    this._classProcessors = [];
    this._classProcessors.push(serviceAnnotationClassProcessor, factoryAnnotationClassProcessor);
  }

  public async initialize(application: ApplicationManager): Promise<void> {
    application.registerClassProcessor(...this._classProcessors);
    this._dependencyManager.value('applicationManager', application);
  }

  get dependencyManager(): DependencyManager {
    return this._dependencyManager;
  }
}

