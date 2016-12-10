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

export interface EndpointInfo {
  path: string,
  type: RequestType,
  callback: Function
}


const requestMappingMetadataKey = Symbol("requestMappingMD");

export function RequestMapping(path: string, type?: RequestType) {
  type = type || RequestType.GET;
  return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    let endpoints: EndpointInfo[] = Reflect.getMetadata(requestMappingMetadataKey, target) || [];
    endpoints.push({path: path, type: type, callback: descriptor.value});
    Reflect.defineMetadata(requestMappingMetadataKey, endpoints, target);
  };
}

export function ResponseBody(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
  let originalMethod = descriptor.value;
  descriptor.value = function () {
    let returnValue = originalMethod.apply(this, arguments);
    let response = arguments[1];
    // If the returned value is a promise, resolve it first and then send the resulting value
    if (returnValue && typeof returnValue.then === 'function') {
      return returnValue.then((value: any) => response.send(value));
    }
    response.send(returnValue);
    return returnValue;
  }
}

export class MVC {
  public static getEndpoints(target: any): EndpointInfo[] {
    return Reflect.getMetadata(requestMappingMetadataKey, target) ||
      Reflect.getMetadata(requestMappingMetadataKey, target.prototype) ||
      [];
  }
}