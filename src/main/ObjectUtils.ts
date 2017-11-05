'use strict';

import "reflect-metadata";

const CONFIGURATION_KEY_PREFIX = ':node-boot-config:';
const METADATA_KEY_PREFIX = '::node-boot:';
const METHOD_METADATA_KEY = `${METADATA_KEY_PREFIX}:method`;

export class ObjectUtils {
  public static * toIterable(value) {
    if (value instanceof Array) {
      for (let i = 0; i < value.length; i++) {
        yield value[i];
      }
      return;
    }
    if (typeof value === 'object') {
      let keys = Object.keys[value];
      for (let key of Reflect.ownKeys(value)) {
        yield {key: key, value: value[key]};
      }
    }
  }

  public static extractClassName(classz: Function): string {
    let asString = classz.toString();
    if (asString === '[object]') {
      asString = classz.constructor.toString();
    }
    if (classz.name) {
      return classz.name;
    }
    let match = asString.match(/(?:function|class)[\s]*(\w+).*(\(|\{)/);
    if (!match) {
      console.log('The class must specify a name.', classz);
      return null;
    }
    return match[1];
  }

  public static isClass(classz: Function): boolean {
    return classz.toString().indexOf('class') === 0;
  }

  public static extractArgs(classz: Function): string[] {
    let regexStr = '\\(([^)]*)\\)';
    if (this.isClass(classz)) {
      regexStr = 'constructor[ ]*' + regexStr;
    }
    let match = classz.toString().match(new RegExp(regexStr));
    if (!match) {
      return [];
    }


    return match[1]
      .split(',')
      .map(name => name.trim())
      .filter((value: string, index: number, array: string[]) => !!value)
      .map(param => ObjectUtils.removeInitialUnderscores(param));
  }

  private static removeInitialUnderscores(param: string): string {
    let correctName = param.match(/[_]*(.*)/)[1];
    if (!correctName) {
      return param;
    }
    return correctName;
  }

  /**
   * Make sure the first char is lower case.
   */
  public static toInstanceName(name) {
    return name.replace(/^./, name[0].toLowerCase());
  }

  public static getClassMethods(classz: Function): Function[] {
    let result: Function[] = [];
    for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(classz))) {
      let method = classz[name];
      if (!(method instanceof Function) || method === classz) continue;
      result.push(method);
    }
    return result;
  }

  public static getConfigurationName(resourceName: string): string {
    return CONFIGURATION_KEY_PREFIX + resourceName;
  }

  public static flattenMapValues(map: Map<any, any[]>) {
    return Array.from(map.values()).reduce((a, b) => a.concat(b), [])
  }

  public static getValue(object: Object, path: string): any {
    let parts = path.split('.');
    let result = object;
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i];
      if (Reflect.has(result, part)) {
        result = result[part];
      } else {
        let found = false;
        for (let j = i; j < parts.length; j++, i++) {
          part = `${part}.${parts[j]}`;
          if (Reflect.has(result, part)) {
            result = result[part];
            found = true;
            break;
          }
        }
        if (!found) {
          return undefined;
        }
      }
    }
    return result;
  }
}