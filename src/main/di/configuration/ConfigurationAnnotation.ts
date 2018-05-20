import "reflect-metadata";
import {ClassType} from "../../ClassType";
import {ConfigurationOptions} from "./ControllerOptions";
import {ConfigurationInfo} from "./ControllerInfo";
import {InjectableAnnotation} from "../injectable/InjectableAnnotation";

export function Configuration(options: ConfigurationOptions | Function): any {
  let controllerOptions: ConfigurationOptions;

  function defineConfiguration(target: any) {
    new ConfigurationAnnotation(controllerOptions, target);
  }

  // If no parameters were given typescript passes the target as parameter
  if (options instanceof Function) {
    let target = <Function>options;
    controllerOptions = {};
    defineConfiguration(target);
    return target;
  }

  controllerOptions = options || {};

  return function controllerFactory(target) {
    return defineConfiguration(target);
  }
}


export class ConfigurationAnnotation extends InjectableAnnotation {
  public readonly configurationInfo: ConfigurationInfo;

  constructor(options: ConfigurationOptions, targetClass: ClassType) {
    super(options, targetClass);
    this.configurationInfo = {
      name: options.name,
      classz: targetClass
    };
    this.annotateClass(targetClass);
  }
}