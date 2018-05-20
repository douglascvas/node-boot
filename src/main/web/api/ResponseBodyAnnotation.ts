import {Annotation} from "../../core/Annotation";
import {ClassType} from "../../ClassType";

export function ResponseBody(target: any,
                             propertyKey: string,
                             descriptor: TypedPropertyDescriptor<(req, res, next?) => any>) {
  new ResponseBodyAnnotation(descriptor, target);
  return descriptor;
}

export class ResponseBodyAnnotation extends Annotation {
  constructor(descriptor: TypedPropertyDescriptor<Function>, target: ClassType) {
    super();
    this.annotateMethod(descriptor, target);
  }
}