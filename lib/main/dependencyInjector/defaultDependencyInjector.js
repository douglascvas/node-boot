'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const dependencyInjector_1 = require("./dependencyInjector");
const loggerFactory_1 = require("../loggerFactory");
const optional_1 = require("../optional");
const objectUtils_1 = require("../objectUtils");
class DefaultDependencyInjector {
    constructor(loggerFactory) {
        this.loggerFactory = loggerFactory;
        this.loggerFactory = loggerFactory || new loggerFactory_1.LoggerFactory();
        this.logger = loggerFactory.getLogger('dependencyInjector');
        this.translationMap = new Map();
        this.units = new Map();
        this.value('dependencyInjector', this);
    }
    value(name, value) {
        return __awaiter(this, void 0, void 0, function* () {
            name = this.translateName(name);
            this.logger.debug(`Registering value ${name}.`);
            let unit = this.getOrCreateUnit(name);
            unit.instanceValue = value;
            unit.resolved = true;
            yield this.resolveReferences(unit);
        });
    }
    service(classz, name = null) {
        let unit = this.getOrCreateUnit(name, classz);
        return this.add(unit);
    }
    factory(factoryName, factoryFn, factoryContext) {
        return __awaiter(this, void 0, void 0, function* () {
            this.assertIsFunction(factoryFn, 'The factory must be a function.');
            let classz = (typeof factoryName === 'string') ? null : factoryName;
            let name = (typeof factoryName === 'string') ? factoryName : null;
            let unit = this.getOrCreateUnit(name, classz, factoryFn, factoryContext);
            this.logger.debug(`Registering factory for ${unit.name}`);
            return this.add(unit);
        });
    }
    findOne(name) {
        if (typeof name !== 'string') {
            name = objectUtils_1.ObjectUtils.extractClassName(name);
        }
        name = objectUtils_1.ObjectUtils.toInstanceName(name);
        name = this.translateName(name);
        let unit = this.units.get(name);
        if (!unit || !unit.resolved) {
            return optional_1.Optional.empty();
        }
        return optional_1.Optional.ofNullable(unit.instanceValue);
    }
    findAll() {
        return this.getUnitsWithResolvedStatusAs(true).map((unit) => ({
            name: unit.name,
            value: unit.instanceValue,
            classz: unit.classz
        }));
    }
    assertAllResolved() {
        let unitNames = this.getUnitsWithResolvedStatusAs(false).map(unit => unit.name);
        if (unitNames.length) {
            throw new Error(`Some units could not be resolved: ` +
                Array.from(this.units)
                    .map(value => value[1])
                    .filter((unit) => !unit.resolved && this.isUnregisteredUnit(unit))
                    .map((unit) => `"${unit.name}"`)
                    .join(','));
        }
    }
    add(unit) {
        if (unit.resolved) {
            this.logger.debug(`Skipping registration of service ${unit.name}. Service is already resolved.`);
            return;
        }
        return this.resolve(unit);
    }
    setReference(dependencyName, unit) {
        let dependencyUnit = this.getOrCreateUnit(dependencyName);
        dependencyUnit.referencedBy.set(unit.name, unit);
        return dependencyUnit;
    }
    resolve(unit, resolveQueue = []) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            if (unit.resolved) {
                return true;
            }
            resolveQueue = [].concat(resolveQueue);
            if (resolveQueue.indexOf(unit.name) >= 0) {
                throw new Error(`Circular dependency found at ${unit.name}: ${resolveQueue.concat(' > ')}`);
            }
            resolveQueue.push(unit.name);
            if (this.isUnregisteredUnit(unit)) {
                return false;
            }
            let allDependenciesResolved = true;
            let dependencies = unit.classArgs
                .map((arg) => {
                let dependencyUnit = this.setReference(arg, unit);
                allDependenciesResolved = allDependenciesResolved && dependencyUnit.resolved;
                return dependencyUnit;
            });
            if (typeof unit.factoryContext === 'string') {
                let factoryUnit = this.setReference(unit.factoryContext, unit);
                allDependenciesResolved = allDependenciesResolved && factoryUnit.resolved;
            }
            if (!allDependenciesResolved) {
                return false;
            }
            let instantiated = yield this.instantiate(unit, dependencies);
            if (instantiated) {
                this.resolveReferences(unit, resolveQueue);
            }
            return true;
        });
    }
    resolveReferences(unit, resolveQueue = []) {
        return __awaiter(this, void 0, void 0, function* () {
            let references = Array.from(unit.referencedBy)
                .map(value => value[1])
                .map((referencer) => this.resolve(referencer, resolveQueue));
            yield Promise.all(references);
        });
    }
    getOrCreateUnit(name, classz, factory, factoryContext) {
        let unitName = this.getInstanceName(classz, name);
        let classArgs = [];
        if (factory) {
            classArgs = objectUtils_1.ObjectUtils.extractArgs(factory);
        }
        else if (classz) {
            classArgs = objectUtils_1.ObjectUtils.extractArgs(classz);
        }
        let unit = this.units.get(unitName);
        if (typeof factoryContext === 'function') {
            factoryContext = this.getInstanceName(factoryContext);
        }
        if (unit) {
            return this.updateUnitData(unit, factory, factoryContext, classz, classArgs);
        }
        unit = new dependencyInjector_1.Unit(unitName, classz, classArgs, factory, factoryContext);
        this.units.set(unitName, unit);
        return unit;
    }
    updateUnitData(unit, factory, factoryContext, classz, classArgs) {
        unit.factory = unit.factory || factory;
        unit.classz = unit.classz || classz;
        unit.classArgs = unit.classArgs.length ? unit.classArgs : classArgs;
        unit.factoryContext = factoryContext;
        return unit;
    }
    getInstanceName(classz, name) {
        if (!name || typeof name !== 'string') {
            let className = objectUtils_1.ObjectUtils.extractClassName(classz);
            if (!className) {
                return;
            }
            name = objectUtils_1.ObjectUtils.toInstanceName(className);
        }
        return this.translateName(objectUtils_1.ObjectUtils.toInstanceName(name));
    }
    getUnitsWithResolvedStatusAs(status) {
        let result = [];
        for (let unit of this.units.values()) {
            if (!!unit.resolved === status) {
                result.push(unit);
            }
        }
        return result;
    }
    translateName(name) {
        if (this.translationMap.has(name)) {
            return this.translationMap.get(name);
        }
        return name;
    }
    defaultFactory(classz, dependencies) {
        this.logger.debug("Registering service: ", this.getFunctionName(classz));
        return new (Function.prototype.bind.apply(classz, [classz].concat(dependencies)));
    }
    isUnregisteredUnit(unit) {
        return !unit.classz && !unit.factory && !unit.resolved;
    }
    instantiate(unit, dependencies) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isUnregisteredUnit(unit)) {
                return false;
            }
            let dependencyValues = dependencies.map(dependency => dependency.instanceValue);
            if (unit.factory) {
                let factoryContext = (typeof unit.factoryContext === 'string') ? this.getOrCreateUnit(unit.factoryContext).instanceValue : unit.factoryContext || null;
                unit.instanceValue = yield unit.factory.apply(factoryContext, dependencyValues);
            }
            else {
                unit.instanceValue = this.defaultFactory(unit.classz, dependencyValues);
            }
            unit.resolved = true;
            return true;
        });
    }
    assertIsFunction(value, errorMessage) {
        if (typeof value !== 'function') {
            throw new Error(errorMessage);
        }
    }
    getFunctionName(classz) {
        if (typeof classz !== 'string') {
            return objectUtils_1.ObjectUtils.extractClassName(classz);
        }
        return classz;
    }
}
exports.DefaultDependencyInjector = DefaultDependencyInjector;

//# sourceMappingURL=defaultDependencyInjector.js.map
