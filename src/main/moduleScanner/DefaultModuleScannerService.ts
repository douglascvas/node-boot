'use strict';

import * as glob from "glob";
import * as path from "path";
import {ModuleScannerService, ClassInfo} from "./ModuleScannerService";
import {ObjectUtils} from "../ObjectUtils";

export class DefaultModuleScannerService implements ModuleScannerService {

  public async scan(includePaths?: string[], excludePaths?: string[]): Promise<ClassInfo[]> {
    let result: ClassInfo[] = [];
    let classMap: Map<string, Function> = await this.findClasses(includePaths, excludePaths);
    for (let entry of classMap.entries()) {
      let [key, value] = entry;
      if (typeof value === 'function') {
        result.push({name: key, classz: value});
      }
    }
    return result;
  }

  private async findClasses(includePaths?: string[], excludePaths?: string[]): Promise<Map<string, any>> {
    const result: Map<string, any> = new Map();

    const mainPattern: string = includePaths.join('|');
    const options: any = {};
    if (excludePaths && excludePaths.length) {
      options.ignore = excludePaths.join('|');
    }

    let files: any[] = await this.searchFiles(mainPattern, options);
    files.forEach(file => this.extractModuleInfo(file, result));
    return result;
  }

  private searchFiles(mainPattern: string, options: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      glob(mainPattern, options, function (err, files) {
        if (err) {
          return reject(err);
        }
        return resolve(files);
      });
    });
  }

  private extractModuleInfo(file, result: Map<string, any>) {
    const mod = require(path.resolve(file));
    const entries = ObjectUtils.toIterable(mod);
    for (let entry of entries) {
      result.set(entry.key, entry.value);
    }
  }

}