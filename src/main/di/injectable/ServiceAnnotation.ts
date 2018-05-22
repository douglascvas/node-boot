import "reflect-metadata";
import {InjectableOptions} from "./InjectableOptions";
import {InjectableAnnotation} from "./InjectableAnnotation";

export function Service(options: InjectableOptions | string | Function): any {
  let serviceOptions: InjectableOptions = {};

  function defineService(target: any) {
    new InjectableAnnotation(serviceOptions, target);
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

