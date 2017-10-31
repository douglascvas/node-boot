import "reflect-metadata";
import {Annotation} from "../../core/Annotation";
import {ServiceInfo} from "./ServiceInfo";
import {ServiceOptions} from "./ServiceOptions";
import {ClassType} from "../../ClassType";

export function Service(options: ServiceOptions | string | Function): any {
  let serviceOptions: ServiceOptions = {};

  function defineService(target: any) {
    new ServiceAnnotation(serviceOptions, target);
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

export class ServiceAnnotation extends Annotation {
  public readonly serviceInfo: ServiceInfo;

  constructor(serviceOptions: ServiceOptions, targetClass: ClassType) {
    super();
    this.serviceInfo = {
      name: serviceOptions.name,
      skipParentRegistration: serviceOptions.skipParentRegistration || null,
      dependencies: serviceOptions.dependencies || null,
      classz: targetClass
    };
    this.annotateClass(targetClass);
  }
}
