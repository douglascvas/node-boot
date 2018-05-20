// import {MethodMetadata} from "./MethodMetadata";
// import {ClassMetadata} from "./ClassMetadata";
//
// export class ClassTransformer {
//   public transformClass(classz: Function): Function {
//     return new Proxy(classz, {
//       get: function (target, propertyKey, receiver) {
//         if (!target.hasOwnProperty(propertyKey)) {
//           return new Proxy(target[propertyKey] || {}, this);
//         }
//         return Reflect.get(target, propertyKey, receiver);
//       },
//       construct: function (target, args) {
//         return new Proxy(Reflect.construct(target, args), this);
//       },
//       apply: async function (originalMethod: Function, thisArg, argumentsList) {
//         let classMetadata = ClassMetadata.getOrCreateClassMetadata(thisArg);
//         let metadata: MethodMetadata = classMetadata.getOrCreateMethodMetadata(originalMethod);
//         await metadata.triggerMethodCall(originalMethod, thisArg, argumentsList);
//       }
//     });
//   }
// }