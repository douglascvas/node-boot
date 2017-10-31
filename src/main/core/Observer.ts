export class Observer<E> {
  private _listeners: Array<(E) => void>;

  constructor() {
    this._listeners = [];
  }

  public subscribe(listener: (...E) => void): Function {
    this._listeners.push(listener);
    return () => {
      let fnIndex;
      while ((fnIndex = this._listeners.indexOf(listener)) >= 0) {
        this._listeners.splice(fnIndex, 1);
      }
    };
  }

  public async trigger(...value: E[]): Promise<any> {
    for (let fn of this._listeners) {
      if (typeof fn === 'function') {
        return await fn.apply(fn, value);
      }
    }
  }

}
