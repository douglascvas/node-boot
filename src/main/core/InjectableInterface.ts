import "reflect-metadata";

const METADATA_KEY = Symbol('$injectable-interfaces');

@_injectableInterface
export class InjectableInterface {
  static isInterface(target): boolean {
    return typeof target === 'function' && Reflect.getMetadata(METADATA_KEY, target);
  }
}

function _injectableInterface(target) {
  Reflect.defineMetadata(METADATA_KEY, true, target);
}
