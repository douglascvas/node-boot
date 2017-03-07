'use strict';
import {DependencyInjector, Unit, UnitInfo} from "./DependencyInjector";
import {LoggerFactory} from "../LoggerFactory";
import {Optional} from "../Optional";
import {ObjectUtils} from "../ObjectUtils";
import {ConsoleLoggerFactory} from "../ConsoleLoggerFactory";

export class DefaultDependencyInjector implements DependencyInjector {
  private translationMap: Map<string,string>;
  private logger;
  private units: Map<string, Unit>;

  constructor(private loggerFactory?: LoggerFactory) {
    this.loggerFactory = loggerFactory || new ConsoleLoggerFactory();
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
   * @param factoryName {string|function} The name of the dependency that will be resolved by the factory function.
   * If a function is passed to this parameter, the name of the function will be extracted and used instead.
   *
   * @param factoryFn {function} Function that will be called to resolve the value of the dependency.
   * The function will be called with following parameters:
   * - classz {function} class to be instantiated.
   * - dependencyValue {*} dependencies to be injected into the class constructor.
   *
   * @param factoryContext {any} Context in which the factory function runs. If string, the value will be resolved from
   * the injector.
   */
  public async factory(factoryName: string|Function, factoryFn: Function, factoryContext?: any): Promise<boolean> {
    this.assertIsFunction(factoryFn, 'The factory must be a function.');

    let classz: Function = (typeof factoryName === 'string') ? null : <Function>factoryName;
    let name: string = (typeof factoryName === 'string') ? <string>factoryName : null;
    let unit = this.getOrCreateUnit(name, classz, factoryFn, factoryContext);
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
          .filter((unit: Unit) => !unit.resolved && this.isUnregisteredUnit(unit))
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

  private setReference(dependencyName: string, unit: Unit) {
    let dependencyUnit: Unit = this.getOrCreateUnit(dependencyName);
    dependencyUnit.referencedBy.set(unit.name, unit);
    return dependencyUnit;
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

    // Unit without classz are those created temporarily by some unit that depends on it.
    if (this.isUnregisteredUnit(unit)) {
      return false;
    }

    let allDependenciesResolved = true;
    let dependencies = unit.classArgs
      .map((arg: string) => {
        let dependencyUnit = this.setReference(arg, unit);
        allDependenciesResolved = allDependenciesResolved && dependencyUnit.resolved;
        return dependencyUnit;
      });

    if (typeof unit.factoryContext === 'string') {
      let factoryUnit: Unit = this.setReference(unit.factoryContext, unit);
      allDependenciesResolved = allDependenciesResolved && factoryUnit.resolved;
    }

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
      .map((referencer: Unit) => this.resolve(referencer, resolveQueue));
    await Promise.all(references);
  }

  private getOrCreateUnit(name: string, classz?: Function, factory?: Function, factoryContext?: any): Unit {
    let unitName: string = this.getInstanceName(classz, name);
    let classArgs: string[] = [];
    if (factory) {
      classArgs = ObjectUtils.extractArgs(factory);
    } else if (classz) {
      classArgs = ObjectUtils.extractArgs(classz);
    }

    let unit = this.units.get(unitName);
    if (typeof factoryContext === 'function') {
      factoryContext = this.getInstanceName(factoryContext);
    }
    if (unit) {
      return this.updateUnitData(unit, factory, factoryContext, classz, classArgs);
    }
    unit = new Unit(unitName, classz, classArgs, factory, factoryContext);
    this.units.set(unitName, unit);
    return unit;
  }

  private updateUnitData(unit: Unit, factory: Function, factoryContext: any, classz: Function, classArgs: string[]): Unit {
    unit.factory = unit.factory || factory;
    unit.classz = unit.classz || classz;
    unit.classArgs = unit.classArgs.length ? unit.classArgs : classArgs;
    unit.factoryContext = factoryContext;
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
    return this.translateName(ObjectUtils.toInstanceName(name));
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

  private isUnregisteredUnit(unit: Unit): boolean {
    return !unit.classz && !unit.factory && !unit.resolved;
  }

  private async instantiate(unit: Unit, dependencies: Unit[]): Promise<boolean> {
    if (this.isUnregisteredUnit(unit)) {
      return false;
    }
    let dependencyValues = dependencies.map(dependency => dependency.instanceValue);
    if (unit.factory) {
      let factoryContext = (typeof unit.factoryContext === 'string') ? this.getOrCreateUnit(unit.factoryContext).instanceValue : unit.factoryContext || null;
      unit.instanceValue = await unit.factory.apply(factoryContext, dependencyValues);
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