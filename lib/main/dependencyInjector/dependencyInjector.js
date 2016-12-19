'use strict';
class Unit {
    constructor(name, classz, classArgs, factory, factoryContext) {
        this.name = name;
        this.classz = classz;
        this.classArgs = classArgs;
        this.factory = factory;
        this.factoryContext = factoryContext;
        this.classArgs = classArgs || [];
        this.referencedBy = new Map();
        this.resolved = false;
        this.factory = factory || null;
    }
}
exports.Unit = Unit;

//# sourceMappingURL=dependencyInjector.js.map
