export type MethodCallListener = (methodName: string, args: any[], next: Function) => any;

interface MethodCallListenerInfo {
  fn: MethodCallListener,
  methodName: string
}

export class ChainedMethodCallObserver {
  private _listeners: MethodCallListenerInfo[];

  constructor() {
    this._listeners = [];
  }

  public subscribe(listener: MethodCallListener, methodName?: string): Function {
    let info = {
      fn: listener,
      methodName: methodName
    };
    this._listeners.push(info);
    return () => {
      let fnIndex;
      while ((fnIndex = this._listeners.indexOf(info)) >= 0) {
        this._listeners.splice(fnIndex, 1);
      }
    };
  }

  public async trigger(originalMethod: Function, thisArg: any, argumentsList: any[]): Promise<any> {
    let next = async () => await Reflect.apply(originalMethod, thisArg, argumentsList);
    // create a chain
    for (let i = this._listeners.length - 1; i >= 0; i--) {
      let listenerInfo = this._listeners[i];
      if (!listenerInfo.methodName || listenerInfo.methodName === originalMethod.name) {
        next = async () => await Reflect.apply(listenerInfo.fn, thisArg, [originalMethod.name, argumentsList, next]);
      }
    }
    return await next();
  }

}
