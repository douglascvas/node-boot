import {LoggerFactory} from "../../logging/LoggerFactory";
import {Logger} from "../../logging/Logger";
import {FactoryInfo} from "./FactoryInfo";
import {ObjectUtils} from "../../ObjectUtils";
import {ClassProcessor} from "../../core/ClassProcessor";
import {ConsoleLoggerFactory} from "../../logging/ConsoleLoggerFactory";
import {DependencyManager} from "../DependencyManager";
import {FactoryHelper} from "./Factory";

export class FactoryAnnotationClassProcessor implements ClassProcessor {
  private _logger: Logger;

  constructor(builder: FactoryAnnotationClassProcessorBuilder) {
    let loggerFactory = builder.loggerFactory || new ConsoleLoggerFactory();
    this._logger = loggerFactory.getLogger(FactoryAnnotationClassProcessor);
  }

  public async processClass(classz: Function, dependencyManager: DependencyManager): Promise<void> {
    let factoriesInfo: FactoryInfo[] = FactoryHelper.getDeclaredFactories(classz);
    for (let factoryInfo of factoriesInfo) {
      this._logger.debug(`Registering @Factory ${ObjectUtils.extractClassName(classz)}: ${factoryInfo.name}`);
      await dependencyManager.factory(factoryInfo);
    }
  }

  public async onApplicationLoad(dependencyManager: DependencyManager): Promise<void> {
    return null;
  }

  public static Builder(): FactoryAnnotationClassProcessorBuilder {
    return new FactoryAnnotationClassProcessorBuilder();
  }
}

export class FactoryAnnotationClassProcessorBuilder {
  private _loggerFactory: LoggerFactory;

  public withLoggerFactory(loggerFactory): FactoryAnnotationClassProcessorBuilder {
    this._loggerFactory = loggerFactory;
    return this;
  }

  public build(): FactoryAnnotationClassProcessor {
    return new FactoryAnnotationClassProcessor(this);
  }

  get loggerFactory(): LoggerFactory {
    return this._loggerFactory;
  }
}