'use strict';

import * as chai from "chai";
import {FactoryInfo} from "../../../../main/dependencyManager/factory/FactoryInfo";
import {Factory, FactoryHelper} from "../../../../main/dependencyManager/factory/Factory";

const assert = chai.assert;

describe('Factory', function () {

  it('should register factory with parameters', async function () {
    // given
    let factories: FactoryInfo[] = FactoryHelper.getDeclaredFactories(FactoryTest);

    // then
    assert.equal(factories[0].name, 'testFactory');
    assert.deepEqual(factories[0].dependencies, ['dep1', Dep2]);
    assert.equal(factories[0].factoryFn, FactoryTest.prototype.factoryWithParameters);
    assert.equal(factories[0].context, FactoryTest);
  });

  it('should register factory without parameters', async function () {
    // when
    let factories: FactoryInfo[] = FactoryHelper.getDeclaredFactories(FactoryTest);

    // then
    assert.equal(factories[1].name, null);
    assert.equal(factories[1].dependencies, null);
    assert.equal(factories[1].factoryFn, FactoryTest.prototype.factoryWithoutParameters);
    assert.equal(factories[1].context, FactoryTest);
  });

  it('should register factory with name as parameter', async function () {
    // given
    let factories: FactoryInfo[] = FactoryHelper.getDeclaredFactories(FactoryTest);

    // then
    assert.equal(factories[2].name, 'namedFactory');
    assert.equal(factories[2].dependencies, null);
    assert.equal(factories[2].factoryFn, FactoryTest.prototype.factoryWithNameParameters);
    assert.equal(factories[2].context, FactoryTest);
  });

  class Dep2 {
  }

  class FactoryTest {
    @Factory({name: 'testFactory', dependencies: ['dep1', Dep2]})
    public factoryWithParameters() {
    }

    @Factory
    public factoryWithoutParameters() {
    }

    @Factory('namedFactory')
    public factoryWithNameParameters() {
    }
  }

});