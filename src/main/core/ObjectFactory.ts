import {ClassMetadata} from "./ClassMetadata";
import {ClassType} from "../ClassType";

export class ObjectFactory {
  async createInstance(classz: ClassType, args: any[]): Promise<any> {
    let classMetadata: ClassMetadata = ClassMetadata.getOrCreateClassMetadata(classz);
    let constructorFn = () => new (Function.prototype.bind.apply(classz, [classz].concat(args)));
    return await classMetadata.triggerClassConstruct(constructorFn, args);
  }
}