import {JsObject} from "./JsObject";
import {Metadata} from "./Metadata";
import {ClassType} from "../ClassType";
import {ClassMetadata} from "./ClassMetadata";
import {MethodMetadata} from "./MethodMetadata";

export type AnnotationType = (new <T extends Annotation>(...args) => T);

export abstract class Annotation extends JsObject {
  private _metadata: Metadata;

  protected annotateClass(targetClass: ClassType) {
    if (this._metadata) {
      return;
    }
    let classMetadata: ClassMetadata = ClassMetadata.getOrCreateClassMetadata(targetClass);
    this._metadata = classMetadata;
    classMetadata.addAnnotation(this);
  }

  /**
   * This method should be called before anything else, because it will proxy the original method
   * and replace the methodDescriptor.value.
   */
  protected annotateMethod(methodDescriptor: TypedPropertyDescriptor<Function>, targetClass: ClassType) {
    if (this._metadata) {
      return;
    }
    let classMetadata: ClassMetadata = ClassMetadata.getOrCreateClassMetadata(targetClass);
    let methodMetadata: MethodMetadata = classMetadata.getOrCreateMethodMetadata(methodDescriptor);
    this._metadata = methodMetadata;
    methodMetadata.addAnnotation(this);
  }

  public static getClassAnnotationsFrom(classz: ClassType) {
    let classMetadata: ClassMetadata = ClassMetadata.getOrCreateClassMetadata(classz);
    return classMetadata.getClassAnnotation(this.className);
  }

  get metadata(): Metadata {
    return this._metadata;
  }
}

