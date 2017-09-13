import "reflect-metadata";

export class RequestType {
  static GET = new RequestType('get');
  static POST = new RequestType('post');
  static PUT = new RequestType('put');
  static PATCH = new RequestType('patch');
  static DELETE = new RequestType('delete');

  constructor(private _value) {
  }

  get value() {
    return this._value;
  }
}