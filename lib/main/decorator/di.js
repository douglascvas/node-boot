"use strict";
require("reflect-metadata");
const factoryMetadataKey = Symbol("factoryMD");
const servicesMetadataKey = Symbol("servicesMD");
const autoscanMetadataKey = Symbol("autoScanMD");
function Factory(name) {
    return function (target, propertyKey, descriptor) {
        let producers = Reflect.getMetadata(factoryMetadataKey, target) || [];
        producers.push({ name: name, factory: descriptor.value });
        Reflect.defineMetadata(factoryMetadataKey, producers, target);
    };
}
exports.Factory = Factory;
function Service(name) {
    function defineService(target) {
        let services = Reflect.getMetadata(servicesMetadataKey, target) || [];
        services.push({ name: name, classz: target });
        Reflect.defineMetadata(servicesMetadataKey, services, target);
    }
    if (name && typeof name === 'string') {
        return defineService;
    }
    let target = name;
    name = null;
    defineService(target);
    return target;
}
exports.Service = Service;
function AutoScan(includePaths, excludePaths) {
    if (typeof includePaths === 'string') {
        includePaths = [includePaths];
    }
    if (typeof excludePaths === 'string') {
        excludePaths = [excludePaths];
    }
    return function (target) {
        Reflect.defineMetadata(autoscanMetadataKey, {
            includePaths: includePaths || [],
            excludePaths: excludePaths || []
        }, target);
    };
}
exports.AutoScan = AutoScan;
function getMetadata(key, target, defaultValue) {
    return Reflect.getMetadata(key, target) ||
        Reflect.getMetadata(key, target.prototype) || defaultValue;
}
class DI {
    static getAutoScanConfig(target) {
        return getMetadata(autoscanMetadataKey, target, null);
    }
    static getDeclaredServices(target) {
        return getMetadata(servicesMetadataKey, target, []);
    }
    static getDeclaredFactories(target) {
        return getMetadata(factoryMetadataKey, target, []);
    }
}
exports.DI = DI;

//# sourceMappingURL=di.js.map
