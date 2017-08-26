'use strict';

export class Unit {
  public name: string;
  public classz: Function;

  public instanceValue: any;
  public referencedBy: Set<Unit>;
  public dependencies: Set<Unit>;
  public factory: Function;
  public factoryContext: Unit;
  public instanceReference?: Unit;

  public registered: boolean;
  public resolved: boolean;

  constructor(name: string) {
    this.name = name;
    this.referencedBy = new Set();
    this.resolved = false;
    this.registered = false;
    this.dependencies = new Set();
    this.factory = null;
  }
}
