import {AutoScannerClassProvider} from "./autoScanner/AutoScannerClassProvider";
import {ApplicationModule} from "../ApplicationModule";
import {ApplicationManager} from "../ApplicationManager";
import {AutoScanOptions} from "./autoScanner/AutoScanOptions";
import {ObjectUtils} from "../ObjectUtils";
import {LoggerFactory} from "../logging/LoggerFactory";
import {ConsoleLoggerFactory} from "../logging/ConsoleLoggerFactory";

export class CoreModule implements ApplicationModule {
  private _loggerFactory: LoggerFactory;
  private _autoScannerClassProvider: AutoScannerClassProvider;

  constructor(options: CoreModuleOptions = {}) {
    this._loggerFactory = options.loggerFactory || new ConsoleLoggerFactory();
    this._autoScannerClassProvider = options.autoScannerClassProvider;
  }

  public async initialize(application: ApplicationManager): Promise<void> {
    let autoScanOptions: AutoScanOptions = ObjectUtils.getValue(application.getApplicationConfig(), "nodeBoot.core.autoScan") || {};
    this._autoScannerClassProvider = this._autoScannerClassProvider || new AutoScannerClassProvider({
      autoScanOptions,
      loggerFactory: this._loggerFactory
    });
    application.registerClassProvider(this._autoScannerClassProvider)
  }
}

export interface CoreModuleOptions {
  loggerFactory?: LoggerFactory;
  autoScannerClassProvider?: AutoScannerClassProvider;
}