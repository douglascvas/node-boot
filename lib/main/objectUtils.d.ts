import "reflect-metadata";
export declare class ObjectUtils {
    static toIterable(value: any): IterableIterator<any>;
    static extractClassName(classz: Function): string;
    static isClass(classz: Function): boolean;
    static extractArgs(classz: Function): string[];
    static toInstanceName(name: any): any;
}
