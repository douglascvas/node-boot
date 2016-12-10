import {EndpointInfo} from "../decorator/mvc";

export interface RouteManager {
  registerApi(endpointInfo: EndpointInfo, classInstance: any);
}