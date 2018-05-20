import {DependencyManager} from "../DependencyManager";
import {LoggerFactory} from "../../logging/LoggerFactory";
import {Logger} from "../../logging/Logger";
import {ObjectUtils} from "../../ObjectUtils";
import {InjectableInfo} from "./InjectableInfo";
import {ClassProcessor} from "../../core/ClassProcessor";
import {ConsoleLoggerFactory} from "../../logging/ConsoleLoggerFactory";
import {ClassType} from "../../ClassType";
import {ClassMetadata} from "../../core/ClassMetadata";
import {InjectableAnnotation} from "./InjectableAnnotation";

export class ServiceAnnotationClassProcessorOptions {
  dependencyManager: DependencyManager;
  loggerFactory?: LoggerFactory;
}

export class InjectableAnnotationClassProcessor implements ClassProcessor {
  private _logger: Logger;
  private _dependencyManager: DependencyManager;

  constructor(options: ServiceAnnotationClassProcessorOptions) {
    let loggerFactory = options.loggerFactory || new ConsoleLoggerFactory();
    this._logger = loggerFactory.getLogger(InjectableAnnotationClassProcessor);
    this._dependencyManager = options.dependencyManager;
  }

  public async processClass(classz: ClassType): Promise<void> {
    let classMetadata: ClassMetadata = ClassMetadata.getOrCreateClassMetadata(classz);
    let serviceAnnotation: InjectableAnnotation = classMetadata.getClassAnnotation(InjectableAnnotation.className);
    let serviceInfo: InjectableInfo = serviceAnnotation ? serviceAnnotation.injectableInfo : null;
    if (serviceInfo) {
      this._logger.debug(`Registering @Injectable ${serviceInfo.name || ObjectUtils.extractClassName(serviceInfo.classz)}`);
      await this._dependencyManager.injectable(serviceInfo);
    }
  }

  public async onApplicationLoad(): Promise<void> {
    return null;
  }
}
