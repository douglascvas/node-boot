'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const sinon = require("sinon");
const chai = require("chai");
const loggerFactory_1 = require("../../main/loggerFactory");
const defaultDependencyInjector_1 = require("../../main/dependencyInjector/defaultDependencyInjector");
const assert = chai.assert;
describe('DefaultDependencyInjector', function () {
    let loggerFactory;
    let dependencyInjector;
    const FOO_ID = 'fooId';
    const BAR_ID = 'barId';
    const ROCKET_ID = 'rocketId';
    beforeEach(() => {
        loggerFactory = sinon.createStubInstance(loggerFactory_1.LoggerFactory);
        loggerFactory.getLogger.returns(sinon.createStubInstance(loggerFactory_1.Logger));
        dependencyInjector = new defaultDependencyInjector_1.DefaultDependencyInjector(loggerFactory);
    });
    describe('#value', function () {
        it('should register a value', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let value = 123;
                yield dependencyInjector.value("test", value);
                let result = dependencyInjector.findOne("test");
                assert.equal(result.get(), value);
            });
        });
    });
    describe('#service', function () {
        it('should register a service extracting name from class', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield dependencyInjector.service(Foo);
                let foo = dependencyInjector.findOne('foo');
                assert.isTrue(foo.isPresent());
                assert.equal(foo.get().id, FOO_ID);
            });
        });
        it('should register a service with given name', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield dependencyInjector.service(Foo, 'customFooName');
                let foo = dependencyInjector.findOne('customFooName');
                assert.isTrue(foo.isPresent());
                assert.equal(foo.get().id, FOO_ID);
                foo = dependencyInjector.findOne('foo');
                assert.isFalse(foo.isPresent());
            });
        });
        it('should register a service with a dependency', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield dependencyInjector.service(Foo);
                yield dependencyInjector.service(Bar);
                let bar = dependencyInjector.findOne('bar');
                assert.isTrue(bar.isPresent());
                assert.equal(bar.get().id, BAR_ID);
                assert.isTrue(!!bar.get().foo);
                assert.equal(bar.get().foo.id, FOO_ID);
            });
        });
        it('should register a service with a dependency registered after it', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield dependencyInjector.service(Bar);
                yield dependencyInjector.service(Foo);
                let bar = dependencyInjector.findOne('bar');
                assert.isTrue(bar.isPresent());
                assert.equal(bar.get().id, BAR_ID);
                assert.isTrue(!!bar.get().foo);
                assert.equal(bar.get().foo.id, FOO_ID);
            });
        });
    });
    describe('#factory', function () {
        it('should register a factory by extracting the name from the class', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let factoryFn = function (rocket) {
                    let result = new Foo();
                    result.rocket = rocket;
                    result.rocket.id = "space rocket";
                    return result;
                };
                yield dependencyInjector.service(Rocket);
                yield dependencyInjector.factory(Foo, factoryFn);
                let foo = dependencyInjector.findOne('foo');
                assert.isTrue(foo.isPresent());
                assert.equal(foo.get().id, FOO_ID);
                assert.isTrue(!!foo.get().rocket);
                assert.equal(foo.get().rocket.id, "space rocket");
            });
        });
        it('should register a factory using the given name', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let factoryFn = function (rocket) {
                    let result = new Foo();
                    result.rocket = rocket;
                    result.rocket.id = "space rocket";
                    return result;
                };
                yield dependencyInjector.service(Rocket);
                yield dependencyInjector.factory('customFoo', factoryFn);
                let foo = dependencyInjector.findOne('customFoo');
                assert.isTrue(foo.isPresent());
                assert.equal(foo.get().id, FOO_ID);
                assert.isTrue(!!foo.get().rocket);
                assert.equal(foo.get().rocket.id, "space rocket");
            });
        });
        it('should resolve a factory whose dependency is registered after it', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let factoryFn = function (rocket) {
                    let result = new Foo();
                    result.rocket = rocket;
                    result.rocket.id = "space rocket";
                    return result;
                };
                yield dependencyInjector.factory(Foo, factoryFn);
                yield dependencyInjector.service(Rocket);
                let foo = dependencyInjector.findOne('foo');
                assert.isTrue(foo.isPresent());
                assert.equal(foo.get().id, FOO_ID);
                assert.isTrue(!!foo.get().rocket);
                assert.equal(foo.get().rocket.id, "space rocket");
            });
        });
        it('should register a factory setting the right context registered by name', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield dependencyInjector.factory('planet', Rocket.prototype.factoryFn, 'rocket');
                yield dependencyInjector.service(Rocket);
                yield dependencyInjector.service(Foo);
                let planet = dependencyInjector.findOne('planet');
                assert.isTrue(planet.isPresent());
                assert.equal(planet.get().fooId, FOO_ID);
                assert.equal(planet.get().rocketId, ROCKET_ID);
            });
        });
        it('should register a factory setting the right context registered by class', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield dependencyInjector.factory('planet', Rocket.prototype.factoryFn, Rocket);
                yield dependencyInjector.service(Rocket);
                yield dependencyInjector.service(Foo);
                let planet = dependencyInjector.findOne('planet');
                assert.isTrue(planet.isPresent());
                assert.equal(planet.get().fooId, FOO_ID);
                assert.equal(planet.get().rocketId, ROCKET_ID);
            });
        });
    });
    class Rocket {
        constructor() {
            this.id = ROCKET_ID;
        }
        factoryFn(foo) {
            return { fooId: foo.id, rocketId: this.id };
        }
        ;
    }
    class Foo {
        constructor() {
            this.id = FOO_ID;
            this.rocket = null;
        }
    }
    class Bar {
        constructor(foo) {
            this.foo = foo;
            this.id = BAR_ID;
        }
    }
    process.on('unhandledRejection', (reason) => {
        console.log('Reason: ', reason);
    });
});

//# sourceMappingURL=defaultDependencyInjector.unittest.js.map
