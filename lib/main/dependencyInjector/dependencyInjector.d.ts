import { Optional } from "../optional";
export declare class Unit {
    name: string;
    classz: Function;
    classArgs: string[];
    factory: Function;
    factoryContext: any;
    resolved: boolean;
    instanceValue: any;
    referencedBy: Map<string, Unit>;
    constructor(name: string, classz: Function, classArgs: string[], factory?: Function, factoryContext?: any);
}
export interface UnitInfo {
    name: string;
    value: any;
    classz: Function;
}
export interface DependencyInjector {
    assertAllResolved(): void;
    value(name: string, value: any): Promise<void>;
    service(classz: any, name?: string): Promise<boolean>;
    factory(name: string | Function, factoryFn?: Function, factoryContext?: any): Promise<boolean>;
    findOne(name: any): Optional<any>;
    findAll(): UnitInfo[];
    assertAllResolved(): void;
}
