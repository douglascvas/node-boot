import { EndpointInfo } from "../decorator/mvc";
import { LoggerFactory } from "../loggerFactory";
import { WebManager } from "./webManager";
export declare class ExpressWebManager implements WebManager {
    private expressApp;
    private loggerFactory;
    private logger;
    private router;
    constructor(expressApp: any, loggerFactory?: LoggerFactory);
    registerApi(endpointInfo: EndpointInfo, classInstance: any): void;
}
