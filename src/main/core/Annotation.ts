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

  protected annotateMethod(targetMethod: Function, targetClass: ClassType) {
    if (this._metadata) {
      return;
    }
    let classMetadata: ClassMetadata = ClassMetadata.getOrCreateClassMetadata(targetClass);
    let methodMetadata: MethodMetadata = classMetadata.getOrCreateMethodMetadata(targetMethod);
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

