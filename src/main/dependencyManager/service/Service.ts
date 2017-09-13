import "reflect-metadata";
import {ServiceInfo} from "./ServiceInfo";
import {ObjectUtils} from "../../ObjectUtils";
import {ServiceOptions} from "./ServiceOptions";

const servicesMetadataKey = Symbol("servicesMD");

export function Service(options: ServiceOptions | string | Function): any {
  let serviceOptions: ServiceOptions = {};

  function defineService(target: any) {
    let serviceInfo: ServiceInfo = {
      name: serviceOptions.name,
      skipParentRegistration: serviceOptions.skipParentRegistration || null,
      dependencies: serviceOptions.dependencies || null,
      classz: target
    };
    Reflect.defineMetadata(servicesMetadataKey, serviceInfo, target)
  }

  // No parameter was given, so we received the target object from typescript
  if (options instanceof Function) {
    let target = options;
    serviceOptions.name = null;
    defineService(target);
    return target;
  }

  // The name of the service was passed as parameter
  if (typeof options === 'string') {
    serviceOptions = {name: options};
  } else {
    // Parameter is a ServiceOptions.
    serviceOptions = options || {};
  }

  return defineService;
}

export class ServiceHelper {
  private static getMetadata(key, target, defaultValue) {
    return Reflect.getMetadata(key, target) ||
      Reflect.getMetadata(key, target.prototype) || defaultValue;
  }

  public static getDeclaredService(target: any): ServiceInfo {
    return ServiceHelper.getMetadata(servicesMetadataKey, target, null);
  }
}
