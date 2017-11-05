import {ApplicationModule} from "../../../ApplicationModule";
import {ApplicationManager} from "../../../ApplicationManager";
import {Application} from "express";
import {ExpressRequestMappingClassProcessor} from "./ExpressRequestMappingClassProcessor";
import {WebModule, WebModuleOptions} from "../../WebModule";

export interface ExpressWebModuleOptions extends WebModuleOptions {
  expressApp: string | Application,
  expressRequestMappingClassProcessor?: ExpressRequestMappingClassProcessor;
}

export class ExpressWebModule extends WebModule implements ApplicationModule {
  private _expressApp: string | Application;
  private _expressRequestMappingClassProcessor: ExpressRequestMappingClassProcessor;

  constructor(options: ExpressWebModuleOptions) {
    super();
    this._expressApp = options.expressApp;
    this._expressRequestMappingClassProcessor = options.expressRequestMappingClassProcessor;
  }

  public async initialize(application: ApplicationManager): Promise<void> {
    await super.initialize(application);

    let expressRequestMappingClassProcessor = this._expressRequestMappingClassProcessor || new ExpressRequestMappingClassProcessor({
      expressApp: this._expressApp,
      dependencyManager: application.getDependencyManager(),
      loggerFactory: this._loggerFactory
    });

    application.registerClassProcessor(expressRequestMappingClassProcessor);
  }
}

