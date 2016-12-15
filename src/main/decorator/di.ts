import "reflect-metadata";

const factoryMetadataKey = Symbol("factoryMD");
const servicesMetadataKey = Symbol("servicesMD");
const autoscanMetadataKey = Symbol("autoScanMD");

export interface FactoryInfo {
  name: string,
  factory: Function
}

export interface ServiceInfo {
  name: string,
  classz: Function
}

export interface AutoScanInfo {
  includePaths: string[],
  excludePaths: string[]
}

export function Factory(name: any) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let producers: FactoryInfo[] = Reflect.getMetadata(factoryMetadataKey, target) || [];
    producers.push({name: name, factory: descriptor.value});
    Reflect.defineMetadata(factoryMetadataKey, producers, target);
  }
}

/**
 */
export function Service(name?: any): any {
  function defineService(target: any) {
    let services: ServiceInfo[] = Reflect.getMetadata(servicesMetadataKey, target) || [];
    services.push({name: name, classz: target});
    Reflect.defineMetadata(servicesMetadataKey, services, target)
  }

  if (name && typeof name === 'string') {
    return defineService;
  }

  // No parameter
  let target = name;
  name = null;
  defineService(target);
  return target;
}

export function AutoScan(includePaths: string|string[], excludePaths?: string|string[]) {
  if (typeof includePaths === 'string') {
    includePaths = [<string>includePaths];
  }
  if (typeof excludePaths === 'string') {
    excludePaths = [<string>excludePaths];
  }
  return function (target: any) {
    Reflect.defineMetadata(autoscanMetadataKey, <AutoScanInfo>{
      includePaths: includePaths || [],
      excludePaths: excludePaths || []
    }, target);
  }
}

function getMetadata(key, target, defaultValue) {
  return Reflect.getMetadata(key, target) ||
    Reflect.getMetadata(key, target.prototype) || defaultValue;
}

export class DI {
  public static getAutoScanConfig(target: any): AutoScanInfo {
    return getMetadata(autoscanMetadataKey, target, null);
  }

  public static getDeclaredServices(target: any): ServiceInfo[] {
    return getMetadata(servicesMetadataKey, target, []);
  }

  public static getDeclaredFactories(target: any): FactoryInfo[] {
    return getMetadata(factoryMetadataKey, target, []);
  }

}