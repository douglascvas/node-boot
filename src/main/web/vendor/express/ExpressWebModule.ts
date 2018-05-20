import {ApplicationModule} from "../../../ApplicationModule";
import {Application} from "express";
import {ExpressRequestMappingClassProcessor} from "./ExpressRequestMappingClassProcessor";
import {WebModule, WebModuleOptions} from "../../WebModule";
import {ClassInfo} from "../../../ClassInfo";
import {ModuleContext} from "../../../ModuleContext";

export interface ExpressWebModuleOptions extends WebModuleOptions {
  expressApp: string | Application,
  expressRequestMappingClassProcessor?: ExpressRequestMappingClassProcessor;
}

export class ExpressWebModule extends WebModule implements ApplicationModule {
  private _expressApp: string | Application;
  private _expressRequestMappingClassProcessor: ExpressRequestMappingClassProcessor;
  private _options: ExpressWebModuleOptions;

  constructor(options: ExpressWebModuleOptions) {
    super();
    this._options = options;
    this._expressApp = options.expressApp;
    this._expressRequestMappingClassProcessor = options.expressRequestMappingClassProcessor;
  }

  public async initialize(application: ModuleContext): Promise<void> {
    await super.initialize(application);

    this._expressRequestMappingClassProcessor = this._options.expressRequestMappingClassProcessor ||
      new ExpressRequestMappingClassProcessor({
        expressApp: this._expressApp,
        dependencyManager: application.dependencyManager,
        loggerFactory: this._loggerFactory
      });
  }

  public async applicationLoaded(): Promise<void> {
    await super.applicationLoaded();
    await this._expressRequestMappingClassProcessor.onApplicationLoad();
  }

  public async processClasses(classes: ClassInfo[]): Promise<void> {
    await super.processClasses(classes);
    for (let classInfo of classes) {
      await this._expressRequestMappingClassProcessor.processClass(classInfo.classz);
    }
  }

  public async provideClasses(): Promise<ClassInfo[]> {
    return super.provideClasses();
  }
}

