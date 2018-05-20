import "reflect-metadata";
import {FactoryInfo} from "./FactoryInfo";
import {FactoryOptions} from "./FactoryOptions";
import {Annotation} from "../../core/Annotation";
import {ClassType} from "../../ClassType";

export function Factory(options: FactoryOptions | Object | string,
                        propertyKey?: string, // The name of the method
                        descriptor?: PropertyDescriptor) {
  let factoryOptions: FactoryOptions;

  function defineFactory(target: Object,
                         propertyKey: string,
                         descriptor: PropertyDescriptor): any {
    new FactoryAnnotation(factoryOptions, <ClassType>target.constructor, descriptor);
  }

  // If not parameters where given we assume typescript passes the normal decorator parameters
  if (propertyKey && descriptor) {
    let target = <ClassType>options;
    factoryOptions = {
      name: null,
      dependencies: null
    };
    return defineFactory(target, propertyKey, descriptor);
  }

  if (typeof options === 'string') {
    factoryOptions = {name: options, dependencies: null}
  } else {
    factoryOptions = options || {};
  }

  return defineFactory;
}

export class FactoryAnnotation extends Annotation {
  public readonly factoryInfo: FactoryInfo;

  constructor(factoryOptions: FactoryOptions,
              classz: ClassType,
              descriptor: PropertyDescriptor) {
    super();
    this.annotateMethod(descriptor, classz);
    this.factoryInfo = {
      name: factoryOptions.name,
      factoryFn: descriptor.value,
      dependencies: factoryOptions.dependencies,
      context: classz
    };
  }
}