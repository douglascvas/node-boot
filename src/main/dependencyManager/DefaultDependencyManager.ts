'use strict';
import {DependencyManager} from "./DependencyManager";
import {LoggerFactory} from "../logging/LoggerFactory";
import {ConsoleLoggerFactory} from "../logging/ConsoleLoggerFactory";
import {ObjectUtils} from "../ObjectUtils";
import {Unit} from "./Unit";
import {ServiceInfo} from "./service/ServiceInfo";
import {FactoryInfo} from "./factory/FactoryInfo";

export class DefaultDependencyManager implements DependencyManager {
  private translationMap: Map<string, string>;
  private logger;
  private units: Map<string, Unit>;

  constructor(private builder: DefaultDependencyManagerBuilder) {
    let loggerFactory = builder.loggerFactory || new ConsoleLoggerFactory();
    this.logger = loggerFactory.getLogger(DefaultDependencyManager);
    this.translationMap = new Map();
    this.units = new Map();
    this.value('dependencyManager', this);
  }

  /**
   * Defines a static value that will be used by the dependency management to inject in the
   * classes that has `name` as dependency.
   *
   * @param name {string} Name of the dependency.
   * @param value {string} Value of the dependency.
   */
  public async value(name: string, value: any): Promise<void> {
    this.logger.debug(`Registering value ${name}.`);
    this.registerStaticUnit(name, value);
  }

  public async service(serviceInfo: ServiceInfo): Promise<void> {
    let name = this.extractInstanceName(serviceInfo.name || serviceInfo.classz);
    let dependencies = serviceInfo.dependencies || ObjectUtils.extractArgs(serviceInfo.classz);

    let unit: Unit = this.registerServiceUnit(name, serviceInfo.classz, dependencies);

    if (serviceInfo.name || serviceInfo.skipParentRegistration) {
      return;
    }

    let parentClass = Object.getPrototypeOf(serviceInfo.classz);
    while (parentClass && parentClass.name) {
      this.registerServiceUnit(parentClass.name, serviceInfo.classz, dependencies, unit.name);
      parentClass = Object.getPrototypeOf(parentClass);
    }
  }

  public async factory(factoryInfo: FactoryInfo): Promise<void> {
    let name: string = this.extractInstanceName(factoryInfo.name || factoryInfo.factoryFn);
    let dependencies = factoryInfo.dependencies || ObjectUtils.extractArgs(factoryInfo.factoryFn);
    this.registerFactoryUnit(name, factoryInfo.factoryFn, dependencies, factoryInfo.context);
  }

  public async findOne(name: string | Function): Promise<any> {
    if (typeof name !== 'string') {
      name = ObjectUtils.extractClassName(name);
    }
    let instanceName = ObjectUtils.toInstanceName(name);

    let notRegistered: Set<Unit> = new Set();
    if (!this.units.has(instanceName)) {
      return null;
    }

    let unit: Unit = this.units.get(instanceName);
    if (unit.instanceReference) {
      unit = unit.instanceReference;
    }

    let resolved = await this.resolveUnit(unit, notRegistered);

    if (!resolved) {
      for (let missingUnit of notRegistered) {
        this.logger.error(`The depencency ${missingUnit.name} declared in ${Array.from(missingUnit.referencedBy).join(', ')} 
        could not be found. Make sure you've registered it.`);
      }
      throw new Error(`The dependency could not be resolved: ${unit.name}.`)
    }

    return unit.instanceValue;
  }

  private registerStaticUnit(name: string, value: Function): Unit {
    let unit: Unit = this.getOrCreateUnit(name);
    unit.instanceValue = value;
    unit.resolved = true;
    return unit;
  }

  private registerServiceUnit(name: string,
                              classz: Function,
                              dependencies: (string | Function)[],
                              instanceFrom?: string): Unit {

    let unit: Unit = this.getOrCreateUnit(name);
    unit.classz = classz;
    unit.registered = true;
    // Used in case a unit should share the same instance as other unit. For instance,
    // in class inheritance, where both parent and child class will be registered in
    // separate units.
    if (instanceFrom) {
      unit.instanceReference = this.getOrCreateUnit(instanceFrom);
    }
    this.registerDependencies(dependencies, unit);
    return unit;
  }

  private registerFactoryUnit(factoryName: string,
                              factoryFn: Function,
                              dependencies: (string | Function)[],
                              factoryContext?: string | Function): Unit {

    let unit: Unit = this.getOrCreateUnit(factoryName);
    unit.factory = factoryFn;

    if (factoryContext) {
      let factoryContextName = this.extractInstanceName(factoryContext);
      unit.factoryContext = this.getOrCreateUnit(factoryContextName);
      unit.factoryContext.referencedBy.add(unit);
    }

    unit.registered = true;

    this.registerDependencies(dependencies, unit);
    return unit;
  }

  private getOrCreateUnit(name: string): Unit {
    let instanceName: string = ObjectUtils.toInstanceName(name);
    let unit: Unit = this.units.get(instanceName);
    if (!unit) {
      unit = new Unit(instanceName);
      this.units.set(instanceName, unit);
    }
    return unit;
  }

  private extractInstanceName(classz: string | Function): string {
    let name: string | Function = classz;
    if (typeof name === 'function') {
      name = ObjectUtils.extractClassName(name);
    } else if (typeof name !== 'string') {
      return null;
    }
    return ObjectUtils.toInstanceName(name);
  }

  private registerDependencies(dependencies: (string | Function)[], unit: Unit) {
    for (let dependency of dependencies) {
      let dependencyName = this.extractInstanceName(dependency);
      let dependencyUnit = this.getOrCreateUnit(dependencyName);
      dependencyUnit.referencedBy.add(unit);
      unit.dependencies.add(dependencyUnit);
    }
  }

  private async resolveUnit(unit: Unit, notRegistered: Set<Unit>, unresolved?: Set<Unit>): Promise<boolean> {
    let unresolvedDependencyFound: boolean = false;

    if (unit.resolved) {
      return true;
    }

    unresolved = unresolved || new Set();
    unresolved.add(unit);

    if (unit.factoryContext) {
      await this.resolveDependency(unit, unit.factoryContext, notRegistered, unresolved);
    }

    for (let dependency of unit.dependencies) {
      let resolved = await this.resolveDependency(unit, dependency, notRegistered, unresolved);
      unresolvedDependencyFound = unresolvedDependencyFound || !resolved;
      // we could stop here, but lets continue to get all the broken dependencies
    }
    if (unresolvedDependencyFound) {
      return false;
    }
    await this.resolveUnitInstanceValue(unit);
    unresolved.delete(unit);

    return true;
  }

  private async resolveDependency(referencedBy: Unit,
                                  dependency: Unit,
                                  notRegistered: Set<Unit>,
                                  unresolved?: Set<Unit>): Promise<boolean> {
    if (dependency.resolved) {
      return true;
    }
    if (!dependency.registered) {
      notRegistered.add(dependency);
      return false;
    }
    if (unresolved.has(dependency)) {
      throw new Error(`Circular dependency found at ${referencedBy.name}: ${dependency.name}`);
    }
    return this.resolveUnit(dependency, unresolved, notRegistered);
  }

  private async resolveUnitInstanceValue(unit: Unit): Promise<void> {
    let dependencyValues: any[] = Array.from(unit.dependencies).map((dependency: Unit) => dependency.instanceValue);

    if (unit.factory) {
      let context: any = unit.factoryContext ? unit.factoryContext.instanceValue : null;
      if (!context) {
        this.logger.warn(`No context defined for factory ${unit.name}. 
        You will not be able to reference "this" object in the factory function. Be sure you annotate the class containing the 
        factory method with @Service.`);
      }
      unit.instanceValue = await unit.factory.apply(context, dependencyValues);
    } else {
      unit.instanceValue = ObjectUtils.instantiate(unit.classz, dependencyValues);
    }
    unit.resolved = true;
  }

  public static Builder(): DefaultDependencyManagerBuilder {
    return new DefaultDependencyManagerBuilder();
  }

  // private async resolveReferences(unit: Unit, resolveQueue: string[] = []): Promise<void> {
  //   let references = Array.from(unit.referencedBy)
  //     .map(value => value[1])
  //     .map((referencer: Unit) => this.resolve(referencer, resolveQueue));
  //   await Promise.all(references);
  // }
  //
  // private getParentName(classz) {
  //   if (!classz) {
  //     return null;
  //   }
  //   return Object.getPrototypeOf(classz).name;
  // }
  //   return !unit.classz && !unit.factory && !unit.resolved;
  // }
  //
  // private assertIsFunction(value: Object, errorMessage: string) {
  //   if (typeof value !== 'function') {
  //     throw new Error(errorMessage);
  //   }
  // }
  //
  // private getFunctionName(classz: any) {
  //   if (typeof classz !== 'string') {
  //     return ObjectUtils.extractClassName(classz);
  //   }
  //   return classz;
  // public findAll(): UnitInfo[] {
  //   return this.getUnitsWithResolvedStatusAs(true).map((unit: Unit) => ({
  //     name: unit.name,
  //     value: unit.instanceValue,
  //     classz: unit.classz
  //   }));
  // }
  // }
  //
}

export class DefaultDependencyManagerBuilder {
  private _loggerFactory: LoggerFactory;

  get loggerFactory(): LoggerFactory {
    return this._loggerFactory;
  }

  public withLoggerFactory(value: LoggerFactory): DefaultDependencyManagerBuilder {
    this._loggerFactory = value;
    return this;
  }

  public build(): DefaultDependencyManager {
    return new DefaultDependencyManager(this);
  }
}

