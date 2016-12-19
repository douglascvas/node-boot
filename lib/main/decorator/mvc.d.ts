import "reflect-metadata";
export declare class RequestType {
    private _value;
    static GET: RequestType;
    static POST: RequestType;
    static PUT: RequestType;
    static PATCH: RequestType;
    static DELETE: RequestType;
    constructor(_value: any);
    readonly value: any;
}
export interface EndpointInfo {
    path: string;
    type: RequestType;
    callback: Function;
}
export declare function RequestMapping(path: string, type?: RequestType): (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => void;
export declare function ResponseBody(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): void;
export declare class MVC {
    static getEndpoints(target: any): EndpointInfo[];
}
