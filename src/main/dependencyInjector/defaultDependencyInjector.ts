'use strict';
import {DependencyInjector, Unit, UnitInfo} from "./dependencyInjector";
import {LoggerFactory} from "../loggerFactory";
import {Optional} from "../optional";
import {ObjectUtils} from "../objectUtils";

export class DefaultDependencyInjector implements DependencyInjector {
  private translationMap: Map<string,string>;
  private logger;
  private units: Map<string, Unit>;

  constructor(private loggerFactory?: LoggerFactory) {
    this.loggerFactory = loggerFactory || new LoggerFactory();
    this.logger = loggerFactory.getLogger('dependencyInjector');
    this.translationMap = new Map();
    this.units = new Map();
    this.value('dependencyInjector', this);
  }

  /**
   * Defines an already resolved value, that will be used by the dependency management to inject in the
   * classes that has `name` as constructor dependency.
   *
   * @param name {string} Name of the dependency.
   * @param value {string} Value of the dependency.
   */
  public async value(name: string, value: any): Promise<void> {
    name = this.translateName(name);
    this.logger.debug(`Registering value ${name}.`);
    let unit: Unit = this.getOrCreateUnit(name);
    unit.instanceValue = value;
    unit.resolved = true;
    await this.resolveReferences(unit);
  }

  /**
   * Defines a dependency class, that will be instantiated and injected into the classes that depends on it.
   *
   * @param [name] {string} Name of the dependency. When not specified, the name will be extracted from the
   * class name.
   * @param classz {function} Function to be instantiated.
   */
  public service(classz: any, name: string = null): Promise<boolean> {
    let unit: Unit = this.getOrCreateUnit(name, classz);
    return this.add(unit);
  }


  /**
   * Defines a function that will be used to build the value for the dependency defined by `classz`.
   *
   * @param target {string|function} The name of the dependency that will be resolved by the factory function.
   * If a function is passed to this parameter, the name of the function will be extracted and used instead.
   *
   * @param factoryFn {function} Function that will be called to resolve the value of the dependency.
   * The function will be called with following parameters:
   * - classz {function} class to be instantiated.
   * - dependencyValue {*} dependencies to be injected into the class constructor.
   */
  public async factory(target: any, factoryFn: Function): Promise<boolean> {
    this.assertIsFunction(factoryFn, 'The factory must be a function.');

    let unit = this.getOrCreateUnit(target, target, factoryFn);
    this.logger.debug(`Registering factory for ${unit.name}`);
    // unit.instanceValue = factoryFn();
    return this.add(unit);
  }

  public findOne(name: any): Optional<any> {
    if (typeof name !== 'string') {
      name = ObjectUtils.extractClassName(name);
    }
    name = ObjectUtils.toInstanceName(name);
    name = this.translateName(name);
    let unit = this.units.get(name);
    if (!unit || !unit.resolved) {
      return Optional.empty();
    }
    return Optional.ofNullable(unit.instanceValue);
  }

  public findAll(): UnitInfo[] {
    return this.getUnitsWithResolvedStatusAs(true).map((unit: Unit) => ({
      name: unit.name,
      value: unit.instanceValue,
      classz: unit.classz
    }));
  }

  public assertAllResolved(): void {
    let unitNames = this.getUnitsWithResolvedStatusAs(false).map(unit => unit.name);
    if (unitNames.length) {
      throw new Error(`Some units could not be resolved: ` +
        Array.from(this.units)
          .map(value => value[1])
          .filter((unit: Unit) => !unit.resolved && !unit.classz)
          .map((unit: Unit) => `"${unit.name}"`)
          .join(',')
      );
    }
  }

  private add(unit: Unit): Promise<boolean> {
    if (unit.resolved) {
      this.logger.debug(`Skipping registration of service ${unit.name}. Service is already resolved.`);
      return;
    }
    return this.resolve(unit);
  }

  private async resolve(unit: Unit, resolveQueue: string[] = []): Promise<boolean> {
    const self = this;
    if (unit.resolved) {
      return true;
    }
    resolveQueue = [].concat(resolveQueue);

    if (resolveQueue.indexOf(unit.name) >= 0) {
      throw new Error(`Circular dependency found at ${unit.name}: ${resolveQueue.concat(' > ')}`);
    }
    resolveQueue.push(unit.name);

    // let dependenciesResolved = this.resolveDependencies(unit, self, resolveQueue);
    if (!unit.classz) {
      return false;
    }

    let allDependenciesResolved = true;
    let dependencies = unit.classArgs.map((arg: string) => {
      let dependencyUnit = self.getOrCreateUnit(arg);
      dependencyUnit.referencedBy.set(unit.name, unit);
      allDependenciesResolved = allDependenciesResolved && dependencyUnit.resolved;
      return dependencyUnit;
    });

    if (!allDependenciesResolved) {
      return false;
    }

    let instantiated: boolean = await this.instantiate(unit, dependencies);
    if (instantiated) {
      // Resolve the units that depended on this one
      this.resolveReferences(unit, resolveQueue);
    }
    return true;
  }

  private async resolveReferences(unit: Unit, resolveQueue: string[] = []): Promise<void> {
    let references = Array.from(unit.referencedBy)
      .map(value => value[1])
      .map((unit: Unit) => this.resolve(unit, resolveQueue));
    await Promise.all(references);
  }

  private getOrCreateUnit(name: string, classz?: Function, factory?: Function): Unit {
    let unitName: string = this.getInstanceName(classz, name);
    let classArgs: string[] = (classz ? ObjectUtils.extractArgs(factory || classz) : []);

    let unit = this.units.get(unitName);
    if (unit) {
      return this.updateUnitData(unit, factory, classz, classArgs);
    }
    unit = new Unit(unitName, classz, classArgs, factory);
    this.units.set(unitName, unit);
    return unit;
  }

  private updateUnitData(unit: Unit, factory: Function, classz: Function, classArgs: string[]): Unit {
    unit.factory = unit.factory || factory;
    unit.classz = unit.classz || classz;
    unit.classArgs = unit.classArgs.length ? unit.classArgs : classArgs;
    return unit;
  }

  private getInstanceName(classz: any, name?: string): string {
    if (!name || typeof name !== 'string') {
      let className = ObjectUtils.extractClassName(classz);
      if (!className) {
        return;
      }
      name = ObjectUtils.toInstanceName(className);
    }
    return this.translateName(name);
  }

  private getUnitsWithResolvedStatusAs(status: boolean): Unit[] {
    let result: Unit[] = [];
    for (let unit of this.units.values()) {
      if (!!unit.resolved === status) {
        result.push(unit);
      }
    }
    return result;
  }

  private translateName(name: string): string {
    if (this.translationMap.has(name)) {
      return this.translationMap.get(name);
    }
    return name;
  }

  private defaultFactory(classz, dependencies) {
    this.logger.debug("Registering service: ", this.getFunctionName(classz));
    return new (Function.prototype.bind.apply(classz, [classz].concat(dependencies)));
  }

  private async instantiate(unit: Unit, dependencies: Unit[]): Promise<boolean> {
    if (!unit.classz) {
      return false;
    }
    let dependencyValues = dependencies.map(dependency => dependency.instanceValue);
    if (unit.factory) {
      unit.instanceValue = await unit.factory.apply(null, dependencyValues);
    } else {
      unit.instanceValue = this.defaultFactory(unit.classz, dependencyValues);
    }
    unit.resolved = true;
    return true;
  }

  private assertIsFunction(value: Object, errorMessage: string) {
    if (typeof value !== 'function') {
      throw new Error(errorMessage);
    }
  }

  private getFunctionName(classz: any) {
    if (typeof classz !== 'string') {
      return ObjectUtils.extractClassName(classz);
    }
    return classz;
  }
}