import {EndpointInfo} from "../decorator/mvc";
import {Logger, LoggerFactory} from "../loggerFactory";
import {WebManager} from "./webManager";

export class ExpressWebManager implements WebManager {
  private logger: Logger;

  constructor(private expressApp: any, private loggerFactory?: LoggerFactory) {
    if (loggerFactory) {
      this.logger = loggerFactory.getLogger(ExpressWebManager);
    }
  }

  public registerApi(endpointInfo: EndpointInfo, classInstance: any) {
    let method = endpointInfo.type.value;
    if (this.logger) {
      this.logger.debug(`Registering api - ${method.toUpperCase()} ${endpointInfo.path}.`);
    }
    this.expressApp[method](endpointInfo.path, endpointInfo.callback.bind(classInstance));
  }
}