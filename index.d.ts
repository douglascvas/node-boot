declare module "node-boot" {

  export class RequestType {
    static GET: RequestType;
    static POST: RequestType;
    static PUT: RequestType;
    static PATCH: RequestType;
    static DELETE: RequestType;

    get value(): RequestType;
  }

  export function Service(name?: any): any;

  export function Factory(name: any);

  export function AutoScan(includePaths: string|string[], excludePaths?: string|string[]);

  export function ResponseBody(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>)

  export function RequestMapping(path: string, type?: RequestType);

  export function Inject(classFunc: any): void;

  export function Provide(targetClassFunc: any): (classFunc: any) => void;

}