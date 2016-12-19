import "reflect-metadata";
import { ModuleScannerService } from "./moduleScanner/moduleScannerService";
import { DependencyInjector } from "./dependencyInjector/dependencyInjector";
import { LoggerFactory } from "./loggerFactory";
import { WebManager } from "./webManager/webManager";
export declare class ApplicationManager {
    private mainApplicationClass;
    private webManager;
    private loggerFactory;
    private dependencyInjector;
    private moduleScannerService;
    private logger;
    constructor(mainApplicationClass: any, webManager?: WebManager, loggerFactory?: LoggerFactory, dependencyInjector?: DependencyInjector, moduleScannerService?: ModuleScannerService);
    registerValue(name: string, value: any): Promise<void>;
    registerService(service: Function, name?: string): Promise<boolean>;
    registerFactory(name: string | Function, factoryFn: Function, holder?: any): Promise<boolean>;
    bootstrap(): Promise<any>;
    private scanAndRegisterModules(includePaths?, excludePaths?);
    private registerClass(classInfo);
    private registerEndpoints();
}
