import {DependencyManager} from "../../../dependencyManager/DependencyManager";
import {Logger} from "../../../logging/Logger";
import {LoggerFactory} from "../../../logging/LoggerFactory";
import {ClassProcessor} from "../../../core/ClassProcessor";
import {ConsoleLoggerFactory} from "../../../logging/ConsoleLoggerFactory";
import {ApiLoader} from "../../api/ApiLoader";
import {ObjectUtils} from "../../../ObjectUtils";
import {MethodMetadata} from "../../../core/MethodMetadata";
import {RequiresAuthenticationAnnotation} from "../../security/RequiresAuthentication";
import {ClassMetadata} from "../../../core/ClassMetadata";
import {ClassType} from "../../../ClassType";

export class RequiresAuthenticationClassProcessor implements ClassProcessor {
  private _logger: Logger;

  constructor(builder: RequiresAuthenticationClassProcessorBuilder) {
    let loggerFactory: LoggerFactory = builder.loggerFactory || new ConsoleLoggerFactory();
    this._logger = loggerFactory.getLogger(RequiresAuthenticationClassProcessor);
  }

  public async processClass(classz: ClassType, dependencyManager: DependencyManager): Promise<void> {
    let classMetadata: ClassMetadata = ClassMetadata.getOrCreateClassMetadata(classz);
    let annotations = classMetadata.getMethodAnnotations(RequiresAuthenticationAnnotation.className);
    for (let annotation of annotations) {
      let metadata: MethodMetadata = <MethodMetadata>annotation.metadata;
      await metadata.onMethodCall((methodName, args, next) => this.checkAuthentication(args, next));
    }
  }

  private async checkAuthentication(args, next) {
    let request = args[0];
    throw new Error("Authentication error");
  }

  public async onApplicationLoad(dependencyManager: DependencyManager): Promise<void> {
  }

  public static Builder(): RequiresAuthenticationClassProcessorBuilder {
    return new RequiresAuthenticationClassProcessorBuilder();
  }
}

export class RequiresAuthenticationClassProcessorBuilder {
  private _loggerFactory: LoggerFactory;

  constructor() {
  }

  public build(): RequiresAuthenticationClassProcessor {
    return new RequiresAuthenticationClassProcessor(this);
  }

  public withLoggerFactory(loggerFactory: LoggerFactory): RequiresAuthenticationClassProcessorBuilder {
    this._loggerFactory = loggerFactory;
    return this;
  }

  public get loggerFactory(): LoggerFactory {
    return this._loggerFactory;
  }

}