'use strict';
import {ClassType} from "../ClassType";

export class Unit {
  public name: string;
  public classz: ClassType;

  public instanceValue: any;
  public dependencies: Set<Unit>;
  public factory: Function;
  public factoryContext: Unit;
  public instanceReference?: Unit;

  public registered: boolean;
  public resolved: boolean;

  constructor(name: string) {
    this.name = name;
    this.resolved = false;
    this.registered = false;
    this.dependencies = new Set();
    this.factory = null;
  }
}
