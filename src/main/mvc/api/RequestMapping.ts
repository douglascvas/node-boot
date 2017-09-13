import {RequestType} from "./RequestType";
import {ApiInfo} from "./ApiInfo";
import {RequestMappingOptions} from "./RequestMappingOptions";

const requestMappingMetadataKey = Symbol("requestMappingMD");

export function RequestMapping(requestMappingOptions: string | RequestMappingOptions) {
  let options: RequestMappingOptions = null;
  if (typeof requestMappingOptions === 'string') {
    options = {uri: requestMappingOptions, type: RequestType.GET, filters: []};
  } else {
    options = <RequestMappingOptions>requestMappingOptions;
    options.type = options.type || RequestType.GET;
    options.filters = options.filters || [];
  }
  return function (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    let endpoints: ApiInfo[] = Reflect.getMetadata(requestMappingMetadataKey, target) || [];
    // Here we create a proxy in order to let other annotations (like @ResponseBody) to manipulate the
    // target function. Therefore we access it through "descriptor.value" - that at the time of the call
    // might have been replaced by another proxy - instead of accessing directly the original method.
    let proxy = new Proxy(descriptor.value, {
      apply: function (originalMethod, thisArg, argumentsList) {
        return descriptor.value.apply(thisArg, argumentsList);
      }
    });
    let endpointInfo = {
      uri: options.uri,
      type: options.type,
      fn: proxy,
      filters: options.filters,
      classz: target.constructor
    };
    endpoints.push(endpointInfo);
    Reflect.defineMetadata(requestMappingMetadataKey, endpoints, target);
  };
}

export class MvcHelper {
  public static getApis(target: any): ApiInfo[] {
    return Reflect.getMetadata(requestMappingMetadataKey, target) ||
      Reflect.getMetadata(requestMappingMetadataKey, target.prototype) ||
      [];
  }
}