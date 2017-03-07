import {EndpointInfo} from "../decorator/Mvc";

export interface WebManager {
  registerApi(endpointInfo: EndpointInfo, classInstance: any);
}