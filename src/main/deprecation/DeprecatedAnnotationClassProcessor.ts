import {ClassProcessor} from "../core/ClassProcessor";
import {ConsoleLoggerFactory} from "../logging/ConsoleLoggerFactory";
import {DeprecationInfo} from "./DeprecationInfo";
import {DeprecatedHelper} from "./Deprecated";
import {Logger} from "../logging/Logger";
import {DependencyManager} from "../dependencyManager/DependencyManager";
import {LoggerFactory} from "../logging/LoggerFactory";

export class DeprecatedAnnotationClassProcessor implements ClassProcessor {
  private logger: Logger;

  constructor(builder: DeprecatedAnnotationClassProcessorBuilder) {
    let loggerFactory = builder.loggerFactory || new ConsoleLoggerFactory();
    this.logger = loggerFactory.getLogger(DeprecatedAnnotationClassProcessor);
  }

  public async processClass(classz: Function, dependencyManager: DependencyManager): Promise<void> {
    let deprecationInfo: DeprecationInfo[] = DeprecatedHelper.getDeclaredDeprecations(classz) || [];
    deprecationInfo.forEach(info => {
      this.logger.warn(info.message);
    });
  }

  public async onApplicationLoad(dependencyManager: DependencyManager): Promise<void> {
    return null;
  }

  public static Builder(): DeprecatedAnnotationClassProcessorBuilder {
    return new DeprecatedAnnotationClassProcessorBuilder();
  }
}

export class DeprecatedAnnotationClassProcessorBuilder {
  private _loggerFactory: LoggerFactory;

  public withLoggerFactory(loggerFactory): DeprecatedAnnotationClassProcessorBuilder {
    this._loggerFactory = loggerFactory;
    return this;
  }

  public build(): DeprecatedAnnotationClassProcessor {
    return new DeprecatedAnnotationClassProcessor(this);
  }

  get loggerFactory(): LoggerFactory {
    return this._loggerFactory;
  }
}