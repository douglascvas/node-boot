import {ChainedMethodCallObserver, MethodCallListener} from "./ChainedMethodCallObserver";
import {Annotation, AnnotationType} from "./Annotation";
import {Metadata} from "./Metadata";
import {ClassMetadata} from "./ClassMetadata";
import {Observer} from "./Observer";

export class MethodMetadata extends Metadata {
  private _classMetadata: ClassMetadata;
  private _onAddAnnotationObserver: Observer<Annotation>;
  private _methodAnnotationsMap: Map<string, Annotation>;
  private _method: Function;
  private _callObserver: ChainedMethodCallObserver;

  constructor(method: Function, classMetadata: ClassMetadata) {
    super(classMetadata.targetClass);
    this._callObserver = new ChainedMethodCallObserver();
    this._method = method;
    this._classMetadata = classMetadata;
    this._onAddAnnotationObserver = new Observer();
    this._methodAnnotationsMap = new Map();
  }

  public onAddAnnotation(listener) {
    return this._onAddAnnotationObserver.subscribe(listener);
  }

  public addAnnotation(annotation: Annotation): void {
    if (!this._methodAnnotationsMap.has(annotation.className)) {
      this._methodAnnotationsMap.set(annotation.className, annotation);
    }
    this._onAddAnnotationObserver.trigger(annotation);
  }

  public getAnnotationOfType(annotation: AnnotationType): Annotation {
    return this._methodAnnotationsMap.get((<any>annotation).className) || null
  }

  public hasAnnotationOfType(annotation: AnnotationType): Boolean {
    return !!this.getAnnotationOfType(annotation);
  }

  public onMethodCall(listener: MethodCallListener): Function {
    return this._callObserver.subscribe(listener, this.method.name);
  }

  public triggerMethodCall(originalMethod: Function, thisArg: any, argumentsList: any[]) {
    this._callObserver.trigger(originalMethod, thisArg, argumentsList);
  }

  public getAnnotations(): Annotation[] {
    return Array.from(this._methodAnnotationsMap.values());
  }

  public get method(): Function {
    return this._method;
  }
}