import {DependencyManager} from "../DependencyManager";
import {LoggerFactory} from "../../logging/LoggerFactory";
import {Logger} from "../../logging/Logger";
import {ObjectUtils} from "../../ObjectUtils";
import {ServiceInfo} from "./ServiceInfo";
import {ClassProcessor} from "../../core/ClassProcessor";
import {ConsoleLoggerFactory} from "../../logging/ConsoleLoggerFactory";
import {ClassType} from "../../ClassType";
import {ClassMetadata} from "../../core/ClassMetadata";
import {ServiceAnnotation} from "./ServiceAnnotation";

export class ServiceAnnotationClassProcessorOptions {
  dependencyManager: DependencyManager;
  loggerFactory?: LoggerFactory;
}

export class ServiceAnnotationClassProcessor implements ClassProcessor {
  private _logger: Logger;
  private _dependencyManager: DependencyManager;

  constructor(options: ServiceAnnotationClassProcessorOptions) {
    let loggerFactory = options.loggerFactory || new ConsoleLoggerFactory();
    this._logger = loggerFactory.getLogger(ServiceAnnotationClassProcessor);
    this._dependencyManager = options.dependencyManager;
  }

  public async processClass(classz: ClassType): Promise<void> {
    let classMetadata: ClassMetadata = ClassMetadata.getOrCreateClassMetadata(classz);
    let serviceAnnotation: ServiceAnnotation = classMetadata.getClassAnnotation(ServiceAnnotation.className);
    let serviceInfo: ServiceInfo = serviceAnnotation ? serviceAnnotation.serviceInfo : null;
    if (serviceInfo) {
      this._logger.debug(`Registering @Service ${serviceInfo.name || ObjectUtils.extractClassName(serviceInfo.classz)}`);
      await this._dependencyManager.service(serviceInfo);
    }
  }

  public async onApplicationLoad(): Promise<void> {
    return null;
  }
}
