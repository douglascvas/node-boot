import "reflect-metadata";
import {ControllerInfo} from "./ControllerInfo";
import {ControllerOptions} from "./ControllerOptions";
import {ClassType} from "../../ClassType";
import {InjectableAnnotation} from "../../di/injectable/InjectableAnnotation";

/**
 * Declares a class that will handle HTTP requests.
 * This annotation is necessary if you want to handle any Http request in your
 * class with @RequestMapping.
 *
 * @example
 *
 *    @Controller
 *    class MyTestController  {
 *
 *       @ResponseBody
 *       @RequestMapping({ path: '/my-api', method: RequestType.GET })
 *       public myApi(request: Request, response: Response) {
 *           return "Hello World!";
 *       }
 *    }
 *
 */
export function Controller(options: ControllerOptions | Function): any {
  let controllerOptions: ControllerOptions;

  function defineController(target: any) {
    new ControllerAnnotation(controllerOptions, target);
  }

  // If no parameters were given typescript passes the target as parameter
  if (options instanceof Function) {
    let target = <Function>options;
    controllerOptions = {};
    defineController(target);
    return target;
  }

  controllerOptions = options || {};

  return function controllerFactory(target) {
    return defineController(target);
  }
}


export class ControllerAnnotation extends InjectableAnnotation {
  public readonly controllerInfo: ControllerInfo;

  constructor(options: ControllerOptions, targetClass: ClassType) {
    super(options, targetClass);
    this.controllerInfo = {
      name: options.name,
      uri: options.uri,
      classz: targetClass
    };
    this.annotateClass(targetClass);
  }
}