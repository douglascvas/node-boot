import { ModuleScannerService, ClassInfo } from "./moduleScannerService";
export declare class DefaultModuleScannerService implements ModuleScannerService {
    scan(includePaths?: string[], excludePaths?: string[]): Promise<ClassInfo[]>;
    private findClasses(includePaths?, excludePaths?);
    private searchFiles(mainPattern, options);
    private extractModuleInfo(file, result);
}
