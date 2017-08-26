import "reflect-metadata";
import {ControllerInfo} from "./ControllerInfo";
import {ControllerOptions} from "./ControllerOptions";
import Service from "../../dependencyManager/service/Service";

const controllersMetadataKey = Symbol("controllersMD");

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
    let controllerInfo: ControllerInfo = {
      name: controllerOptions.name,
      uri: controllerOptions.uri,
      classz: target
    };
    Reflect.defineMetadata(controllersMetadataKey, controllerInfo, target)
  }

  // If no parameters were given typescript passes the target as parameter
  if (options instanceof Function) {
    let target = <Function>options;
    controllerOptions = {};
    defineController(target);
    Service(target);
    return target;
  }

  controllerOptions = options || {};

  return function (target) {
    Service(controllerOptions)(target);
    return defineController(target);
  }
}

export class ControllerHelper {
  private static getMetadata(key, target, defaultValue) {
    return Reflect.getMetadata(key, target) ||
      Reflect.getMetadata(key, target.prototype || {}) || defaultValue;
  }

  public static getDeclaredController(target: any): ControllerInfo {
    return ControllerHelper.getMetadata(controllersMetadataKey, target, null);
  }
}

export default Controller;