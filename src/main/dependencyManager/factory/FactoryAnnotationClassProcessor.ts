import {LoggerFactory} from "../../logging/LoggerFactory";
import {Logger} from "../../logging/Logger";
import {FactoryInfo} from "./FactoryInfo";
import {ObjectUtils} from "../../ObjectUtils";
import {ClassProcessor} from "../../core/ClassProcessor";
import {ConsoleLoggerFactory} from "../../logging/ConsoleLoggerFactory";
import {DependencyManager} from "../DependencyManager";
import {ClassMetadata} from "../../core/ClassMetadata";
import {ClassType} from "../../ClassType";
import {FactoryAnnotation} from "./FactoryAnnotation";

export class FactoryAnnotationClassProcessor implements ClassProcessor {
  private _logger: Logger;

  constructor(builder: FactoryAnnotationClassProcessorBuilder) {
    let loggerFactory = builder.loggerFactory || new ConsoleLoggerFactory();
    this._logger = loggerFactory.getLogger(FactoryAnnotationClassProcessor);
  }

  public async processClass(classz: ClassType, dependencyManager: DependencyManager): Promise<void> {
    let classMetadata: ClassMetadata = ClassMetadata.getOrCreateClassMetadata(classz);
    let factoriesInfo: FactoryInfo[] = classMetadata.getMethodAnnotations(FactoryAnnotation.className)
      .map((annotation: FactoryAnnotation) => annotation.factoryInfo);
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