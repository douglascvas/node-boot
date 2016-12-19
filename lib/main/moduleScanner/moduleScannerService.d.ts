export interface ClassInfo {
    name: string;
    classz: Function;
}
export interface ModuleScannerService {
    scan(includePaths?: string[], excludePaths?: string[]): Promise<ClassInfo[]>;
}
