import {RequestType} from "./RequestType";
import {ApiInfo} from "./ApiInfo";
import {RequestMappingOptions} from "./RequestMappingOptions";
import {Annotation} from "../../core/Annotation";
import {ClassType} from "../../ClassType";

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
    new RequestMappingAnnotation(options, target.constructor, descriptor.value);
    return descriptor;
  };
}

export class RequestMappingAnnotation extends Annotation {
  public readonly apiInfo: ApiInfo;

  constructor(options: RequestMappingOptions, classz: ClassType, method: (req: any, res: any, next?: any) => any) {
    super();
    this.apiInfo = {
      uri: options.uri,
      type: options.type,
      fn: method,
      filters: options.filters,
      classz: classz
    };
    this.annotateMethod(method, classz);
  }
}