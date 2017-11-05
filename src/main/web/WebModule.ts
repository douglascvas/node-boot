import {ApplicationModule} from "../ApplicationModule";
import {RequiresAuthenticationClassProcessor} from "./security/RequiresAuthenticationClassProcessor";
import {LoggerFactory} from "../logging/LoggerFactory";
import {ApplicationManager} from "../ApplicationManager";
import {ConsoleLoggerFactory} from "../logging/ConsoleLoggerFactory";

export class WebModule implements ApplicationModule {
  protected _requiresAuthenticationClassProcessor: RequiresAuthenticationClassProcessor;
  protected _loggerFactory: LoggerFactory;

  constructor(options: WebModuleOptions = {}) {
    this._loggerFactory = options.loggerFactory || new ConsoleLoggerFactory();
    this._requiresAuthenticationClassProcessor = options.requiresAuthenticationClassProcessor ||
      new RequiresAuthenticationClassProcessor({loggerFactory: this._loggerFactory});
  }

  public async initialize(application: ApplicationManager): Promise<void> {
    application.registerClassProcessor(this._requiresAuthenticationClassProcessor);
  }
}

export interface WebModuleOptions {
  loggerFactory?: LoggerFactory;
  requiresAuthenticationClassProcessor?: RequiresAuthenticationClassProcessor;
}