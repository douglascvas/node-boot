import {EndpointInfo} from "../decorator/mvc";
import {RouteManager} from "./routeManager";
import {Logger, LoggerFactory} from "../loggerFactory";

export class ExpressRouterManager implements RouteManager {
  private logger: Logger;

  constructor(private expressRouter: any, private loggerFactory?: LoggerFactory) {
    if (loggerFactory) {
      this.logger = loggerFactory.getLogger(ExpressRouterManager);
    }
  }

  public registerApi(endpointInfo: EndpointInfo, classInstance: any) {
    let method = endpointInfo.type.value;
    if (this.logger) {
      this.logger.debug(`Registering api - ${method.toUpperCase()} ${endpointInfo.path}.`);
    }
    this.expressRouter[method](endpointInfo.path, endpointInfo.callback.bind(classInstance));
  }
}