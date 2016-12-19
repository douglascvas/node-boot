import "reflect-metadata";
export interface FactoryInfo {
    name: string;
    factory: Function;
}
export interface ServiceInfo {
    name: string;
    classz: Function;
}
export interface AutoScanInfo {
    includePaths: string[];
    excludePaths: string[];
}
export declare function Factory(name: any): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
export declare function Service(name?: any): any;
export declare function AutoScan(includePaths: string | string[], excludePaths?: string | string[]): (target: any) => void;
export declare class DI {
    static getAutoScanConfig(target: any): AutoScanInfo;
    static getDeclaredServices(target: any): ServiceInfo[];
    static getDeclaredFactories(target: any): FactoryInfo[];
}
