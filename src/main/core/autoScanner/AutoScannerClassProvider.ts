'use strict';
import {ObjectUtils} from "../../ObjectUtils";
import {ClassInfo} from "../../ClassInfo";
import {AutoScanOptions} from "./AutoScanOptions";
import {LoggerFactory} from "../../logging/LoggerFactory";
import {Logger} from "../../logging/Logger";
import {ConsoleLoggerFactory} from "../../logging/ConsoleLoggerFactory";
import {FileScanner} from "./FileScanner";
import {ClassProvider} from "../ClassProvider";
import {ClassType} from "../../ClassType";

export interface AutoScannerClassProviderOptions {
    autoScanOptions?: AutoScanOptions;
    fileScanner?: FileScanner;
    loggerFactory?: LoggerFactory;
}

export class AutoScannerClassProvider implements ClassProvider {
    private _logger: Logger;
    private _fileScanner: FileScanner;
    private _autoScanOptions: AutoScanOptions;

    constructor(options: AutoScannerClassProviderOptions = {}) {
        let loggerFactory = options.loggerFactory || new ConsoleLoggerFactory();
        this._logger = loggerFactory.getLogger(AutoScannerClassProvider);
        this._fileScanner = options.fileScanner || new FileScanner();
        this._autoScanOptions = options.autoScanOptions || {
            enabled: false,
            include: ["./*.js"]
        };
    }

    public async provideClasses(): Promise<ClassInfo[]> {
        let result: ClassInfo[] = [];

        if (!this._autoScanOptions.enabled) {
            return;
        }

        let classMap: Map<string, ClassType> = await this.findClasses();

        for (let entry of classMap.entries()) {
            let [key, value] = entry;
            if (typeof value === 'function') {
                result.push({
                    name: key,
                    classz: value
                });
            }
        }
        return result;
    }

    private async findClasses(): Promise<Map<string, any>> {
        const result: Map<string, any> = new Map();

        let includePaths: string[] = ((this._autoScanOptions.include instanceof Array) ? this._autoScanOptions.include : [this._autoScanOptions.include]);
        let excludePaths: string[] = ((this._autoScanOptions.exclude instanceof Array) ? this._autoScanOptions.exclude : [this._autoScanOptions.exclude]);
        const mainPattern: string = includePaths.join('|');
        const options: any = {};
        if (excludePaths && excludePaths.length) {
            options.ignore = excludePaths.join('|');
        }

        let files: any[] = await this._fileScanner.find(mainPattern, options);
        files.filter(f => f !== '.').forEach(file => this.extractModuleInfo(file, result));
        this._logger.info(`Scanner found ${result.size} files matching ${JSON.stringify(includePaths)}`);
        return result;
    }

    private extractModuleInfo(file, result: Map<string, any>) {
        const mod = this._fileScanner.load(file);
        const entries = ObjectUtils.toIterable(mod);
        for (let entry of entries) {
            result.set(entry.key, entry.value);
        }
    }
}
