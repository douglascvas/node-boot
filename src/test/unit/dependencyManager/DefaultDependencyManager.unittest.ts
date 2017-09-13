'use strict';

import * as chai from "chai";
import {LoggerFactory} from "../../../main/logging/LoggerFactory";
import {DefaultDependencyManager} from "../../../main/dependencyManager/DefaultDependencyManager";
import {TestLoggerFactory} from "../TestLoggerFactory";

const assert = chai.assert;

describe('DefaultDependencyManager', function () {

  let loggerFactory: LoggerFactory;
  let dependencyManager: DefaultDependencyManager;
  const FOO_ID = 'fooId';
  const SPECIAL_FOO_ID = 'specialFooId';
  const BAR_ID = 'barId';
  const ROCKET_ID = 'rocketId';

  beforeEach(() => {
    loggerFactory = new TestLoggerFactory();
    dependencyManager = DefaultDependencyManager.Builder().withLoggerFactory(loggerFactory).build();
  });

  describe('#value', function () {
    it('should register a value', async function () {
      // given
      let value = 123;
      await dependencyManager.value("test", value);

      // when
      let result: any = await dependencyManager.findOne("test");

      // then
      assert.equal(result, value);
    });
  });

  describe('#service', function () {
    it('should register a service extracting name from parent class', async function () {
      // given
      await dependencyManager.service({classz: SpecialFoo});

      // when
      let foo: any = await dependencyManager.findOne('foo');
      let specialFoo: any = await dependencyManager.findOne('specialFoo');

      // then
      assert.isTrue(!!foo);
      assert.equal(foo.id, SPECIAL_FOO_ID);
      assert.equal(foo, specialFoo);
    });

    it('should register a service extracting name from class', async function () {
      // given
      await dependencyManager.service({classz: Foo});

      // when
      let foo: any = await dependencyManager.findOne('foo');

      // then
      assert.isTrue(!!foo);
      assert.equal(foo.id, FOO_ID);
    });

    it('should register a service with given name', async function () {
      // given
      await dependencyManager.service({classz: Foo, name: 'customFooName'});

      // when
      let foo: any = await dependencyManager.findOne('customFooName');

      // then
      assert.isTrue(!!foo);
      assert.equal(foo.id, FOO_ID);

      foo = await dependencyManager.findOne('foo');

      assert.isFalse(!!foo);
    });

    it('should register a service with a dependency', async function () {
      // given
      await dependencyManager.service({classz: Foo});
      await dependencyManager.service({classz: Bar});

      // when
      let bar: any = await dependencyManager.findOne('bar');

      // then
      assert.isTrue(!!bar);
      assert.equal(bar.id, BAR_ID);
      assert.isTrue(!!bar.foo);
      assert.equal(bar.foo.id, FOO_ID);
    });

    it('should register a service with a dependency registered after it', async function () {
      // given
      await dependencyManager.service({classz: Bar});
      await dependencyManager.service({classz: Foo});

      // when
      let bar: any = await dependencyManager.findOne('bar');

      // then
      assert.isTrue(!!bar);
      assert.equal(bar.id, BAR_ID);
      assert.isTrue(!!bar.foo);
      assert.equal(bar.foo.id, FOO_ID);
    });
  });

  describe('#factory', function () {
    it('should register a factory by extracting the name from the factory function', async function () {
      // given
      await dependencyManager.service({classz: Rocket});
      await dependencyManager.factory({factoryFn: specialFooFn});

      // when
      let specialFoo: any = await dependencyManager.findOne('specialFooFn');

      // then
      assert.equal(specialFoo.rocket.id, "space rocket");
    });

    it('should register a factory by extracting the name from the class given on factory name parameter', async function () {
      // given
      await dependencyManager.service({classz: Rocket});
      await dependencyManager.factory({factoryFn: specialFooFn, context: SpecialFoo});

      // when
      let specialFoo: any = await dependencyManager.findOne('specialFooFn');

      // then
      assert.equal(specialFoo.rocket.id, "space rocket");
    });

    it('should register a factory using the given name', async function () {
      // given
      let factoryFn = function (rocket: Rocket) {
        let result: Foo = new Foo();
        result.rocket = rocket;
        result.rocket.id = "space rocket";
        return result;
      };
      await dependencyManager.service({classz: Rocket});
      await dependencyManager.factory({factoryFn: factoryFn, name: 'customFoo'});

      // when
      let foo: any = await dependencyManager.findOne('customFoo');

      // then
      assert.isTrue(!!foo);
      assert.equal(foo.id, FOO_ID);
      assert.isTrue(!!foo.rocket);
      assert.equal(foo.rocket.id, "space rocket");
    });

    it('should resolve a factory whose dependency is registered after it', async function () {
      // given
      let factoryTestFn = function (rocket: Rocket) {
        let result: Foo = new Foo();
        result.rocket = rocket;
        result.rocket.id = "space rocket";
        return result;
      };
      await dependencyManager.factory({factoryFn: factoryTestFn, context: Foo});
      await dependencyManager.service({classz: Rocket});

      // when
      let foo: any = await dependencyManager.findOne('factoryTestFn');

      // then
      assert.isTrue(!!foo);
      assert.equal(foo.id, FOO_ID);
      assert.isTrue(!!foo.rocket);
      assert.equal(foo.rocket.id, "space rocket");
    });

    it('should register a factory setting the right context registered by name', async function () {
      // given
      await dependencyManager.factory({factoryFn: Rocket.prototype.factoryFn, name: 'planet', context: 'rocket'});
      await dependencyManager.service({classz: Rocket});
      await dependencyManager.service({classz: Foo});

      // when
      let planet: any = await dependencyManager.findOne('planet');

      // then
      assert.isTrue(!!planet);
      assert.equal(planet.fooId, FOO_ID);
      assert.equal(planet.rocketId, ROCKET_ID);
    });

    it('should register a factory setting the right context registered by class', async function () {
      // given
      await dependencyManager.factory({factoryFn: Rocket.prototype.factoryFn, name: 'planet', context: Rocket});
      await dependencyManager.service({classz: Rocket});
      await dependencyManager.service({classz: Foo});

      // when
      let planet: any = await dependencyManager.findOne('planet');

      // then
      assert.isTrue(!!planet);
      assert.equal(planet.fooId, FOO_ID);
      assert.equal(planet.rocketId, ROCKET_ID);
    });
  });

  class Rocket {
    id: any = ROCKET_ID;

    public factoryFn(foo: Foo) {
      return {fooId: foo.id, rocketId: this.id};
    };
  }

  class Foo {
    public id: any = FOO_ID;
    public rocket: Rocket = null;
  }

  class SpecialFoo extends Foo {
    public id: any = SPECIAL_FOO_ID;
    public rocket: Rocket = null;
  }

  class Bar {
    id: string = BAR_ID;

    constructor(public foo: Foo) {
    }
  }

  function specialFooFn(rocket: Rocket) {
    let result: Foo = new Foo();
    result.rocket = rocket;
    result.rocket.id = "space rocket";
    return result;
  }

  process.on('unhandledRejection', (reason) => {
    console.log('Reason: ', reason);
  });

});