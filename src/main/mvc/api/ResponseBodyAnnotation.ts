import {Annotation} from "../../core/Annotation";
import {ClassType} from "../../ClassType";

export function ResponseBody(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
  new ResponseBodyAnnotation(descriptor.value, target);
  return descriptor;
}

export class ResponseBodyAnnotation extends Annotation {
  constructor(method: Function, target: ClassType) {
    super();
    this.annotateMethod(method, target);
  }
}