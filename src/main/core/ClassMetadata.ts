import "reflect-metadata";
import {ChainedMethodCallObserver, MethodCallListener} from "./ChainedMethodCallObserver";
import {ClassType} from "../ClassType";
import {MethodMetadata} from "./MethodMetadata";
import {Metadata} from "./Metadata";
import {Annotation} from "./Annotation";

const CLASS_METADATA_KEY = Symbol('ClassMetadata');

export class ClassMetadata extends Metadata {
  private _classAnnotationFromAnnotationName: Map<string, Annotation>;
  private _methodAnnotationsFromAnnotationName: Map<string, Annotation[]>;
  private _methodMetadataFromMethodName: Map<string, MethodMetadata>;
  private _constructObserver: ChainedMethodCallObserver;

  private constructor(targetClass: ClassType) {
    super(targetClass);
    this._constructObserver = new ChainedMethodCallObserver();
    this._classAnnotationFromAnnotationName = new Map();
    this._methodAnnotationsFromAnnotationName = new Map();
    this._methodMetadataFromMethodName = new Map();
  }

  public static getOrCreateClassMetadata(target: ClassType) {
    let classMeta: ClassMetadata = Reflect.getMetadata(CLASS_METADATA_KEY, target);
    if (!classMeta) {
      classMeta = new ClassMetadata(target);
      Reflect.defineMetadata(CLASS_METADATA_KEY, classMeta, target);
    }
    return classMeta;
  }

  public getOrCreateMethodMetadata(methodDescriptor: TypedPropertyDescriptor<Function>) {
    let methodMetadata: MethodMetadata = this._methodMetadataFromMethodName.get(methodDescriptor.value.name);
    if (!methodMetadata) {
      let handler = {
        apply: function(target, thisArg, argumentsList) {
          methodMetadata.triggerMethodCall(target, thisArg, argumentsList);
        }
      };
      let proxy = new Proxy(methodDescriptor.value, handler);
      methodDescriptor.value = proxy;

      methodMetadata = new MethodMetadata(proxy, this);
      methodMetadata.onAddAnnotation(annotation => this.addMethodAnnotation(annotation));
      this._methodMetadataFromMethodName.set(proxy.name, methodMetadata);
    }
    return methodMetadata;
  }

  public addAnnotation(annotation: Annotation) {
    if (!this._classAnnotationFromAnnotationName.has(annotation.className)) {
      this._classAnnotationFromAnnotationName.set(annotation.className, annotation);
    }
  }

  public getClassAnnotation<T extends Annotation>(annotationName: string): T {
    return <T>this._classAnnotationFromAnnotationName.get(annotationName) || null;
  }

  public getMethodAnnotations<T extends Annotation>(annotationName: string): T[] {
    return <T[]>this._methodAnnotationsFromAnnotationName.get(annotationName) || [];
  }

  public onClassConstruct(listener: MethodCallListener) {
    return this._constructObserver.subscribe(listener);
  }

  public triggerClassConstruct(constructor: Function, argumentList: any[]): Promise<any> {
    return this._constructObserver.trigger(constructor, null, argumentList);
  }

  get classAnnotations(): Annotation[] {
    return Array.from(this._classAnnotationFromAnnotationName.values());
  }

  private addMethodAnnotation(annotation: Annotation): void {
    let annotations: Annotation[] = this._methodAnnotationsFromAnnotationName.get(annotation.className);
    if (!annotations) {
      annotations = [];
      this._methodAnnotationsFromAnnotationName.set(annotation.className, annotations);
    }
    annotations.push(annotation);
  }


}