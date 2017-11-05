import {Annotation} from "../../core/Annotation";
import {ClassType} from "../../ClassType";

export function RequiresAuthentication(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
  new RequiresAuthenticationAnnotation(descriptor.value, target);
}

export class RequiresAuthenticationAnnotation extends Annotation {
  constructor(method: Function, targetClass: ClassType) {
    super();
    this.annotateMethod(method, targetClass);
  }
}

// async function annotationMethod(args: any[], next: Function, configuration: MethodAnnotationMetadataConfiguration): Promise<any> {
//   const authenticationManager: AuthenticationManager = await configuration.dependencyManager.findOne('authenticationManager');
//   if (!authenticationManager) {
//     throw new ConfigurationException('No authentication manager configured.')
//   }
//   let request: any = args[0];
//   if (!await authenticationManager.isAuthenticated(request)) {
//     throw new AuthenticationException('User is not authenticated.')
//   }
//   return next.apply(this, args);
// }