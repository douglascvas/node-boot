import "reflect-metadata";
import {FactoryInfo} from "./FactoryInfo";
import {FactoryOptions} from "./FactoryOptions";
import {ServiceHelper} from "../service/Service";

const factoryMetadataKey = Symbol("factoryMD");

export function Factory(options: FactoryOptions | Object | string,
                        propertyKey?: string, // The name of the method
                        descriptor?: PropertyDescriptor) {
  let factoryOptions: FactoryOptions;

  function defineFactory(target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
    let serviceInfo = ServiceHelper.getDeclaredService(target.constructor);
    let context = serviceInfo ? serviceInfo.name || serviceInfo.classz : target.constructor;
    let factories: FactoryInfo[] = Reflect.getMetadata(factoryMetadataKey, target) || [];
    let factoryInfo: FactoryInfo = {
      name: factoryOptions.name,
      factoryFn: descriptor.value,
      dependencies: factoryOptions.dependencies,
      context: context
    };
    factories.push(factoryInfo);
    Reflect.defineMetadata(factoryMetadataKey, factories, target);
  }

  // If no parameters where given we assume typescript passes the normal decorator parameters
  if (propertyKey && descriptor) {
    let target = <Object>options;
    factoryOptions = {
      name: null,
      dependencies: null
    };
    defineFactory(target, propertyKey, descriptor);
    return;
  }

  if (typeof options === 'string') {
    factoryOptions = {name: options, dependencies: null}
  } else {
    factoryOptions = options || {};
  }

  return defineFactory;
}

export class FactoryHelper {
  private static getMetadata(key, target, defaultValue) {
    return Reflect.getMetadata(key, target) ||
      Reflect.getMetadata(key, target.prototype) || defaultValue;
  }

  public static getDeclaredFactories(target: any): FactoryInfo[] {
    return FactoryHelper.getMetadata(factoryMetadataKey, target, []);
  }
}