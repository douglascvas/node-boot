import {Annotation} from "../../core/Annotation";
import {ClassType} from "../../ClassType";

export function RequiresAuthentication(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) {
  new RequiresAuthenticationAnnotation(descriptor, target);
}

export class RequiresAuthenticationAnnotation extends Annotation {
  constructor(descriptor: TypedPropertyDescriptor<Function>, targetClass: ClassType) {
    super();
    this.annotateMethod(descriptor, targetClass);
  }
}