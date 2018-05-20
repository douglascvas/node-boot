import {ApplicationModule} from "../ApplicationModule";
import {RequiresAuthenticationClassProcessor} from "./security/RequiresAuthenticationClassProcessor";
import {LoggerFactory} from "../logging/LoggerFactory";
import {ConsoleLoggerFactory} from "../logging/ConsoleLoggerFactory";
import {ClassInfo} from "../ClassInfo";
import {ModuleContext} from "../ModuleContext";

export class WebModule implements ApplicationModule {
  protected _requiresAuthenticationClassProcessor: RequiresAuthenticationClassProcessor;
  protected _loggerFactory: LoggerFactory;

  constructor(options: WebModuleOptions = {}) {
    this._loggerFactory = options.loggerFactory || new ConsoleLoggerFactory();
    this._requiresAuthenticationClassProcessor = options.requiresAuthenticationClassProcessor ||
      new RequiresAuthenticationClassProcessor({loggerFactory: this._loggerFactory});
  }

  public async initialize(application: ModuleContext): Promise<void> {
  }

  public async applicationLoaded(): Promise<void> {
    await this._requiresAuthenticationClassProcessor.onApplicationLoad();
  }

  public async processClasses(classes: ClassInfo[]): Promise<void> {
    for (let classInfo of classes) {
      await this._requiresAuthenticationClassProcessor.processClass(classInfo.classz);
    }
  }

  public async provideClasses(): Promise<ClassInfo[]> {
    return [];
  }
}

export interface WebModuleOptions {
  loggerFactory?: LoggerFactory;
  requiresAuthenticationClassProcessor?: RequiresAuthenticationClassProcessor;
}