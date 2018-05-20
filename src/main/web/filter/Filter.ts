import "reflect-metadata";
import {FilterInfo} from "./FilterInfo";
import {FilterOptions} from "./FilterOptions";
import {Annotation} from "../../core/Annotation";
import {ClassType} from "../../ClassType";
import {InjectableAnnotation} from "../../di/injectable/InjectableAnnotation";

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
    new FilterAnnotation(filterOptions, target);
    return target;
  }

  // If no parameters were given typescript passes the target as parameter
  if (options instanceof Function) {
    let target = <Function>options;
    filterOptions.name = null;
    defineFilter(target);
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
    return defineFilter(target);
  };
}

export class FilterAnnotation extends Annotation {
  public readonly filterInfo: FilterInfo;

  constructor(filterOptions: FilterOptions, classz: ClassType) {
    super();
    this.filterInfo = {
      name: filterOptions.name,
      dependencies: filterOptions.dependencies,
      classz: classz
    };
    new InjectableAnnotation(filterOptions, classz);
    this.annotateClass(classz);
  }
}