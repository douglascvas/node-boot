'use strict';

import {Optional} from "../Optional";

export class Unit {
  public resolved: boolean;
  public instanceValue: any;
  public referencedBy: Map<string, Unit>;

  constructor(public name: string,
              public classz: Function,
              public classArgs: string[],
              public factory?: Function,
              public factoryContext?: any) {
    this.classArgs = classArgs || [];
    this.referencedBy = new Map();
    this.resolved = false;
    this.factory = factory || null;
  }
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
  factory(name: string|Function, factoryFn?: Function, factoryContext?: any): Promise<boolean>;
  findOne(name: any): Optional<any>;
  findAll(): UnitInfo[];
  assertAllResolved(): void;
}