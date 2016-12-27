import {EndpointInfo} from "../decorator/mvc";
import {Logger, LoggerFactory} from "../loggerFactory";
import {WebManager} from "./webManager";

export class ExpressWebManager implements WebManager {
  private logger: Logger;
  private router: any;

  constructor(private expressApp: any, private loggerFactory?: LoggerFactory) {
    if (loggerFactory) {
      this.logger = loggerFactory.getLogger(ExpressWebManager);
    }
    this.router = expressApp.route();
  }

  public registerApi(endpointInfo: EndpointInfo, classInstance: any) {
    let method = endpointInfo.type.value;
    if (this.logger) {
      this.logger.debug(`Registering api - ${method.toUpperCase()} ${endpointInfo.path}.`);
    }
    this.router[method](endpointInfo.path, endpointInfo.callback.bind(classInstance));
  }
}