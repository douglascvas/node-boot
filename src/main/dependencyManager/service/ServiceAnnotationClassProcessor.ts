import {DependencyManager} from "../DependencyManager";
import {LoggerFactory} from "../../logging/LoggerFactory";
import {Logger} from "../../logging/Logger";
import {ObjectUtils} from "../../ObjectUtils";
import {ServiceInfo} from "./ServiceInfo";
import {ClassProcessor} from "../../core/ClassProcessor";
import {ConsoleLoggerFactory} from "../../logging/ConsoleLoggerFactory";
import {ServiceHelper} from "./Service";

export class ServiceAnnotationClassProcessor implements ClassProcessor {
  private logger: Logger;

  constructor(builder: ServiceAnnotationClassProcessorBuilder) {
    let loggerFactory = builder.loggerFactory || new ConsoleLoggerFactory();
    this.logger = loggerFactory.getLogger(ServiceAnnotationClassProcessor);
  }

  public async processClass(classz: Function, dependencyManager: DependencyManager): Promise<void> {
    let serviceInfo: ServiceInfo = ServiceHelper.getDeclaredService(classz);
    if (serviceInfo) {
      this.logger.debug(`Registering @Service ${serviceInfo.name || ObjectUtils.extractClassName(serviceInfo.classz)}`);
      await dependencyManager.service(serviceInfo);
    }
  }

  public async onApplicationLoad(dependencyManager: DependencyManager): Promise<void> {
    return null;
  }

  public static Builder(): ServiceAnnotationClassProcessorBuilder {
    return new ServiceAnnotationClassProcessorBuilder();
  }
}

export class ServiceAnnotationClassProcessorBuilder {
  private _loggerFactory: LoggerFactory;

  public withLoggerFactory(loggerFactory): ServiceAnnotationClassProcessorBuilder {
    this._loggerFactory = loggerFactory;
    return this;
  }

  public build(): ServiceAnnotationClassProcessor {
    return new ServiceAnnotationClassProcessor(this);
  }

  get loggerFactory(): LoggerFactory {
    return this._loggerFactory;
  }
}