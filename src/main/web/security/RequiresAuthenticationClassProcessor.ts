import {Logger} from "../../logging/Logger";
import {LoggerFactory} from "../../logging/LoggerFactory";
import {ClassProcessor} from "../../core/ClassProcessor";
import {ConsoleLoggerFactory} from "../../logging/ConsoleLoggerFactory";
import {MethodMetadata} from "../../core/MethodMetadata";
import {RequiresAuthenticationAnnotation} from "./RequiresAuthentication";
import {ClassMetadata} from "../../core/ClassMetadata";
import {ClassType} from "../../ClassType";

export class RequiresAuthenticationClassProcessor implements ClassProcessor {
  private _logger: Logger;

  constructor(options: RequiresAuthenticationClassProcessorOptions = {}) {
    let loggerFactory: LoggerFactory = options.loggerFactory || new ConsoleLoggerFactory();
    this._logger = loggerFactory.getLogger(RequiresAuthenticationClassProcessor);
  }

  public async processClass(classz: ClassType): Promise<void> {
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

  public async onApplicationLoad(): Promise<void> {
  }

}

export interface RequiresAuthenticationClassProcessorOptions {
  loggerFactory?: LoggerFactory;
}