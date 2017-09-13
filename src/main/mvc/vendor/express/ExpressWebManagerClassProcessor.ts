import {DependencyManager} from "../../../dependencyManager/DependencyManager";
import {Logger} from "../../../logging/Logger";
import {LoggerFactory} from "../../../logging/LoggerFactory";
import {ClassProcessor} from "../../../core/ClassProcessor";
import {ConsoleLoggerFactory} from "../../../logging/ConsoleLoggerFactory";
import {ExpressApiLoader} from "./ExpressApiLoader";
import {ApiLoader} from "../../api/ApiLoader";

export class ExpressWebManagerClassProcessor implements ClassProcessor {
  private _logger: Logger;
  private _expressApp: any;
  private _apiLoader: ApiLoader;

  constructor(builder: ExpressWebManagerBuilder) {
    let loggerFactory: LoggerFactory = builder.loggerFactory || new ConsoleLoggerFactory();
    this._expressApp = builder.expressApp;
    this._apiLoader = builder.apiLoader || new ExpressApiLoader(this._expressApp, loggerFactory);
    this._logger = loggerFactory.getLogger(ExpressWebManagerClassProcessor);
  }

  public async processClass(classz: Function, dependencyManager: DependencyManager): Promise<void> {
    await this._apiLoader.loadApiInfo(classz);
  }

  public async onApplicationLoad(dependencyManager: DependencyManager): Promise<void> {
    await this._apiLoader.registerApis(dependencyManager);
  }

  public static Builder(expressApp: any): ExpressWebManagerBuilder {
    return new ExpressWebManagerBuilder(expressApp);
  }
}

export class ExpressWebManagerBuilder {
  private _loggerFactory: LoggerFactory;
  private _apiLoader: ApiLoader;

  constructor(private _expressApp: any) {
  }

  public build(): ExpressWebManagerClassProcessor {
    return new ExpressWebManagerClassProcessor(this);
  }

  public withLoggerFactory(loggerFactory: LoggerFactory): ExpressWebManagerBuilder {
    this._loggerFactory = loggerFactory;
    return this;
  }

  public withApiLoader(apiLoader: ApiLoader): ExpressWebManagerBuilder {
    this._apiLoader = apiLoader;
    return this;
  }

  public get expressApp(): any {
    return this._expressApp;
  }

  public get loggerFactory(): LoggerFactory {
    return this._loggerFactory;
  }

  public get apiLoader(): ApiLoader {
    return this._apiLoader;
  }

}