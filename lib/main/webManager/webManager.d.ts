import { EndpointInfo } from "../decorator/mvc";
export interface WebManager {
    registerApi(endpointInfo: EndpointInfo, classInstance: any): any;
}
