import {DependencyManager} from "../../dependencyManager/DependencyManager";
import {Logger} from "../../logging/Logger";
import {LoggerFactory} from "../../logging/LoggerFactory";
import {ClassProcessor} from "../../core/ClassProcessor";
import {ConsoleLoggerFactory} from "../../logging/ConsoleLoggerFactory";
import {ApiLoader} from "./ApiLoader";

export class RequestMappingClassProcessor implements ClassProcessor {
  private _logger: Logger;
  private _apiLoader: ApiLoader;

  constructor(builder: RequestMappingClassProcessorBuilder) {
    let loggerFactory: LoggerFactory = builder.loggerFactory || new ConsoleLoggerFactory();
    this._logger = loggerFactory.getLogger(RequestMappingClassProcessor);
    this._apiLoader = builder.apiLoader;
  }

  public async processClass(classz: Function, dependencyManager: DependencyManager): Promise<void> {
    await this._apiLoader.loadApiInfo(classz);
  }

  public async onApplicationLoad(dependencyManager: DependencyManager): Promise<void> {
    await this._apiLoader.registerApis(dependencyManager);
  }

  public static Builder(apiLoader: ApiLoader): RequestMappingClassProcessorBuilder {
    return new RequestMappingClassProcessorBuilder(apiLoader);
  }
}

export class RequestMappingClassProcessorBuilder {
  private _loggerFactory: LoggerFactory;
  private _apiLoader: ApiLoader;

  constructor(apiLoader) {
    this._apiLoader = apiLoader;
  }

  public build(): RequestMappingClassProcessor {
    return new RequestMappingClassProcessor(this);
  }

  public withLoggerFactory(loggerFactory: LoggerFactory): RequestMappingClassProcessorBuilder {
    this._loggerFactory = loggerFactory;
    return this;
  }

  public get loggerFactory(): LoggerFactory {
    return this._loggerFactory;
  }

  public get apiLoader(): ApiLoader {
    return this._apiLoader;
  }

}