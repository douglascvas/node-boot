import "reflect-metadata";
import {ChainedMethodCallObserver, MethodCallListener} from "./ChainedMethodCallObserver";
import {ClassType} from "../ClassType";
import {MethodMetadata} from "./MethodMetadata";
import {Metadata} from "./Metadata";
import {Annotation} from "./Annotation";

const CLASS_METADATA_KEY = Symbol('ClassMetadata');

export class ClassMetadata extends Metadata {
  /**
   * @key: annotation name
   * @value: annotation
   */
  private _classAnnotationsMap: Map<string, Annotation>;
  /**
   * @key: annotation name
   * @value: annotation
   */
  private _methodAnnotationsMap: Map<string, Annotation[]>;
  /**
   * @key: method name
   * @value: method metadata
   */
  private _methodNameToMethodMetadataMap: Map<string, MethodMetadata>;
  private _constructObserver: ChainedMethodCallObserver;

  private constructor(targetClass: ClassType) {
    super(targetClass);
    this._constructObserver = new ChainedMethodCallObserver();
    this._classAnnotationsMap = new Map();
    this._methodAnnotationsMap = new Map();
    this._methodNameToMethodMetadataMap = new Map();
  }

  public static getOrCreateClassMetadata(target: ClassType) {
    let classMeta: ClassMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, target);
    if (!classMeta) {
      classMeta = new ClassMetadata(target);
      Reflect.defineMetadata(CLASS_METADATA_KEY, classMeta, target);
    }
    return classMeta;
  }

  public getOrCreateMethodMetadata(method: Function) {
    let methodMetadata: MethodMetadata = this._methodNameToMethodMetadataMap.get(method.name);
    if (!methodMetadata) {
      methodMetadata = new MethodMetadata(method, this);
      methodMetadata.onAddAnnotation(annotation => this.addMethodAnnotation(annotation));
      this._methodNameToMethodMetadataMap.set(method.name, methodMetadata);
    }
    return methodMetadata;
  }

  public addAnnotation(annotation: Annotation) {
    if (!this._classAnnotationsMap.has(annotation.className)) {
      this._classAnnotationsMap.set(annotation.className, annotation);
    }
  }

  public getClassAnnotation<T extends Annotation>(annotationName: string): T {
    return <T>this._classAnnotationsMap.get(annotationName) || null;
  }

  public getMethodAnnotations<T extends Annotation>(annotationName: string): T[] {
    return <T[]>this._methodAnnotationsMap.get(annotationName) || [];
  }

  public onClassConstruct(listener: MethodCallListener) {
    return this._constructObserver.subscribe(listener);
  }

  public triggerClassConstruct(constructor: Function, argumentList: any[]): Promise<any> {
    return this._constructObserver.trigger(constructor, null, argumentList);
  }

  get classAnnotations(): Annotation[] {
    return Array.from(this._classAnnotationsMap.values());
  }

  private addMethodAnnotation(annotation: Annotation): void {
    let annotations: Annotation[] = this._methodAnnotationsMap.get(annotation.className);
    if (!annotations) {
      annotations = [];
      this._methodAnnotationsMap.set(annotation.className, annotations);
    }
    annotations.push(annotation);
  }


}