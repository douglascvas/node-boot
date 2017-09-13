// Declared as abstract class to be able to be used as parameter that receives a type,
// and not an instance.
export abstract class BasicFilter {
  abstract filter(request: any, response: any, next: Function): Promise<any>;
}