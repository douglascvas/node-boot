import "reflect-metadata";
import {FilterInfo} from "./FilterInfo";
import {FilterOptions} from "./FilterOptions";
import {Service} from "../../dependencyManager/service/Service";

const filtersMetadataKey = Symbol("filtersMD");

/**
 * Declares a class that will act as a filter for handling HTTP requests.
 * The class must implement the BasicFilter interface.
 *
 * @example
 *
 * @Filter
 * class MyTestFilter implements BasicFilter {
 *    public filter(request: Request, response: Response, next: Function): Promise<any>{
 *        return next();
 *    }
 * }
 *
 */
export function Filter(options: FilterOptions | string | Function): any {
  let filterOptions: FilterOptions = {};

  /**
   * Registers the metadata.
   */
  function defineFilter(target: any) {
    let filterInfo: FilterInfo = {
      name: filterOptions.name,
      dependencies: filterOptions.dependencies,
      skipParentRegistration: filterOptions.skipParentRegistration,
      classz: target
    };
    Reflect.defineMetadata(filtersMetadataKey, filterInfo, target)
  }

  // If no parameters were given typescript passes the target as parameter
  if (options instanceof Function) {
    let target = <Function>options;
    filterOptions.name = null;
    defineFilter(target);
    Service(target);
    return target;
  }

  if (typeof options === 'string') {
    // We received the name of the filter as parameter.
    filterOptions = {name: options};
  } else {
    // We received a FilterOptions object
    filterOptions = options
  }
  return function (target) {
    Service(filterOptions)(target);
    return defineFilter(target);
  };
}

/**
 * Helper class for getting the metadata information from the class.
 */
export class FilterHelper {
  private static getMetadata(key, target, defaultValue) {
    return Reflect.getMetadata(key, target) ||
      Reflect.getMetadata(key, target.prototype) || defaultValue;
  }

  public static getDeclaredFilter(target: any): FilterInfo {
    return FilterHelper.getMetadata(filtersMetadataKey, target, null);
  }
}