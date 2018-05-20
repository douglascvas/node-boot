import "reflect-metadata";
import {Annotation} from "../../core/Annotation";
import {InjectableInfo} from "./InjectableInfo";
import {InjectableOptions} from "./InjectableOptions";
import {ClassType} from "../../ClassType";
import {InjectableInterface} from "../../core/InjectableInterface";

export function Injectable(options: InjectableOptions | string | Function): any {
  let injectableOptions: InjectableOptions = {};

  function defineInjectable(target: any) {
    new InjectableAnnotation(injectableOptions, target);
  }

  if (InjectableInterface.isInterface(options)) {
    options = (<any>options).name;
  }

  // No parameter was given, so we received the target object from typescript
  if (options instanceof Function) {
    let target = options;
    injectableOptions.name = null;
    defineInjectable(target);
    return target;
  }

  // The name of the service was passed as parameter
  if (typeof options === 'string') {
    injectableOptions = {name: options};
  } else {
    // Parameter is a ServiceOptions.
    injectableOptions = options || {};
  }

  return defineInjectable;
}

export class InjectableAnnotation extends Annotation {
  public readonly injectableInfo: InjectableInfo;

  constructor(injectableOptions: InjectableOptions, targetClass: ClassType) {
    super();
    this.injectableInfo = {
      name: injectableOptions.name,
      dependencies: injectableOptions.dependencies || null,
      classz: targetClass
    };
    this.annotateClass(targetClass);
  }
}
