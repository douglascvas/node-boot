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

export class AutoScannerClassProvider implements ClassProvider {
  private _logger: Logger;
  private _fileScanner: FileScanner;
  private _autoScanInfo: AutoScanOptions;

  constructor(builder: AutoScannerClassProviderBuilder) {
    let loggerFactory = builder.loggerFactory || new ConsoleLoggerFactory();
    this._logger = loggerFactory.getLogger(AutoScannerClassProvider);
    this._fileScanner = builder.fileScanner || new FileScanner();
    this._autoScanInfo = builder.autoScanInfo || {
      include: ["./*.js"]
    };
  }

  public async provideClasses(): Promise<ClassInfo[]> {
    let result: ClassInfo[] = [];
    let classMap: Map<string, ClassType> = await this.findClasses(this._autoScanInfo);


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

  private extractDependencies(classz: Function) {
    return ObjectUtils.extractArgs(classz);
  }

  private async findClasses(scanInfo: AutoScanOptions): Promise<Map<string, any>> {
    const result: Map<string, any> = new Map();

    let includePaths: string[] = ((scanInfo.include instanceof Array) ? scanInfo.include : [scanInfo.include]);
    let excludePaths: string[] = ((scanInfo.exclude instanceof Array) ? scanInfo.exclude : [scanInfo.exclude]);
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

  public static Builder(autoScanInfo: AutoScanOptions): AutoScannerClassProviderBuilder {
    return new AutoScannerClassProviderBuilder(autoScanInfo);
  }
}

export class AutoScannerClassProviderBuilder {
  private _autoScanInfo: AutoScanOptions;
  private _fileScanner: FileScanner;
  private _loggerFactory: LoggerFactory;

  constructor(autoScanInfo: AutoScanOptions) {
    this._autoScanInfo = autoScanInfo;
  }

  public get autoScanInfo(): AutoScanOptions {
    return this._autoScanInfo;
  }

  public get fileScanner(): FileScanner {
    return this._fileScanner;
  }

  public withFileScanner(value: FileScanner): AutoScannerClassProviderBuilder {
    this._fileScanner = value;
    return this;
  }

  public get loggerFactory(): LoggerFactory {
    return this._loggerFactory;
  }

  public withLoggerFactory(value: LoggerFactory): AutoScannerClassProviderBuilder {
    this._loggerFactory = value;
    return this;
  }

  public build(): AutoScannerClassProvider {
    return new AutoScannerClassProvider(this);
  }
}