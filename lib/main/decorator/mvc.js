"use strict";
require("reflect-metadata");
class RequestType {
    constructor(_value) {
        this._value = _value;
    }
    get value() {
        return this._value;
    }
}
RequestType.GET = new RequestType('get');
RequestType.POST = new RequestType('post');
RequestType.PUT = new RequestType('put');
RequestType.PATCH = new RequestType('patch');
RequestType.DELETE = new RequestType('delete');
exports.RequestType = RequestType;
const requestMappingMetadataKey = Symbol("requestMappingMD");
function RequestMapping(path, type) {
    type = type || RequestType.GET;
    return function (target, propertyKey, descriptor) {
        let endpoints = Reflect.getMetadata(requestMappingMetadataKey, target) || [];
        endpoints.push({ path: path, type: type, callback: descriptor.value });
        Reflect.defineMetadata(requestMappingMetadataKey, endpoints, target);
    };
}
exports.RequestMapping = RequestMapping;
function ResponseBody(target, propertyKey, descriptor) {
    let originalMethod = descriptor.value;
    descriptor.value = function () {
        let returnValue = originalMethod.apply(this, arguments);
        let response = arguments[1];
        if (returnValue && typeof returnValue.then === 'function') {
            return returnValue.then((value) => response.send(value));
        }
        response.send(returnValue);
        return returnValue;
    };
}
exports.ResponseBody = ResponseBody;
class MVC {
    static getEndpoints(target) {
        return Reflect.getMetadata(requestMappingMetadataKey, target) ||
            Reflect.getMetadata(requestMappingMetadataKey, target.prototype) ||
            [];
    }
}
exports.MVC = MVC;

//# sourceMappingURL=mvc.js.map
