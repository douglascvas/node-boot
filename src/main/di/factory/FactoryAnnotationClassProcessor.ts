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

export interface FactoryAnnotationClassProcessorOptions {
  dependencyManager: DependencyManager;
  loggerFactory?: LoggerFactory;
}

export class FactoryAnnotationClassProcessor implements ClassProcessor {
  private _logger: Logger;
  private _dependencyManager: DependencyManager;

  constructor(options: FactoryAnnotationClassProcessorOptions) {
    let loggerFactory = options.loggerFactory || new ConsoleLoggerFactory();
    this._logger = loggerFactory.getLogger(FactoryAnnotationClassProcessor);
    this._dependencyManager = options.dependencyManager;
  }

  public async processClass(classz: ClassType): Promise<void> {
    let classMetadata: ClassMetadata = ClassMetadata.getOrCreateClassMetadata(classz);
    let factoriesInfo: FactoryInfo[] = classMetadata.getMethodAnnotations(FactoryAnnotation.className)
      .map((annotation: FactoryAnnotation) => annotation.factoryInfo);
    for (let factoryInfo of factoriesInfo) {
      this._logger.debug(`Registering @Factory ${ObjectUtils.extractClassName(classz)}: ${factoryInfo.name}`);
      await this._dependencyManager.factory(factoryInfo);
    }
  }

  public async onApplicationLoad(): Promise<void> {
    return null;
  }
}
