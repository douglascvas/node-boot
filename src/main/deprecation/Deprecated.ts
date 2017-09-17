import {ObjectUtils} from "../ObjectUtils";
import {DeprecationInfo} from "./DeprecationInfo";

const deprecationMetadataKey = Symbol("deprecationMD");

export function Deprecated(description: Object | Function | string, propertyKey?: string, descriptor?: PropertyDescriptor) {
  let message: string = '';

  let defineDeprecation = function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
    let type = 'Class';
    let targetClass = (target instanceof Function) ? target : target.constructor;
    let deprecationInfoList: DeprecationInfo[] = Reflect.getMetadata(deprecationMetadataKey, targetClass) || [];
    let className: string = ObjectUtils.extractClassName(targetClass);
    let annotatedObjectName = className;
    if (propertyKey) {
      annotatedObjectName = [className, propertyKey].filter(s => s).join('.');
      type = descriptor ? 'Method' : 'Property';
    }
    let messageStart = `${type} '${annotatedObjectName}' is deprecated and should not be used anymore. `;
    let deprecationInfo: DeprecationInfo = {
      classz: targetClass,
      functionName: propertyKey || null,
      message: (messageStart + message).trim()
    };
    console.warn(deprecationInfo.message);
    deprecationInfoList.push(deprecationInfo);
    Reflect.defineMetadata(deprecationMetadataKey, deprecationInfoList, targetClass);
  };

  // If no parameters where given we assume typescript passes the normal decorator parameters
  if (typeof description === 'string') {
    message = description;
    return <any>defineDeprecation;
  }

  let target = <Function>description;
  defineDeprecation(target, propertyKey, descriptor);
}

function wrapClass(classz){
  function classDecorator<T extends {new(...args:any[]):{}}>(constructor:T) {
    return class extends constructor {
      constructor(...args:any[]){
        super(...args);
        console.log("")
      }
    }
  }
}


export class DeprecatedHelper {
  private static getMetadata(key, target, defaultValue) {
    return Reflect.getMetadata(key, target) ||
      Reflect.getMetadata(key, target.prototype) || defaultValue;
  }

  public static getDeclaredDeprecations(target: any): DeprecationInfo[] {
    return DeprecatedHelper.getMetadata(deprecationMetadataKey, target, []);
  }
}