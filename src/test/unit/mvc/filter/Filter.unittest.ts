'use strict';

import * as chai from "chai";
import {Filter, FilterHelper} from "../../../../main/mvc/filter/Filter";
import {FilterInfo} from "../../../../main/mvc/filter/FilterInfo";
import {ServiceHelper} from "../../../../main/dependencyManager/service/Service";
import {ServiceInfo} from "../../../../main/dependencyManager/service/ServiceInfo";

const assert = chai.assert;

describe('Filter', function () {

  it('should register filter without parameters', async function () {
    // given
    let filter: FilterInfo = FilterHelper.getDeclaredFilter(FilterWithoutParameters);
    let service: ServiceInfo = ServiceHelper.getDeclaredService(FilterWithoutParameters);

    // then
    assert.equal(filter.name, null);
    assert.equal(filter.classz, FilterWithoutParameters);

    assert.equal(service.name, null);
    assert.equal(service.skipParentRegistration, null);
    assert.equal(service.dependencies, null);
    assert.equal(service.classz, FilterWithoutParameters);
  });

  it('should register filter with parameters', async function () {
    // given
    let filter: FilterInfo = FilterHelper.getDeclaredFilter(FilterWithParameters);
    let service: ServiceInfo = ServiceHelper.getDeclaredService(FilterWithParameters);

    // then
    assert.equal(filter.name, 'testFilter');
    assert.equal(filter.classz, FilterWithParameters);
    assert.deepEqual(filter.dependencies, ['dep1', Dep2]);
    assert.equal(filter.skipParentRegistration, true);

    assert.equal(service.name, 'testFilter');
    assert.equal(service.skipParentRegistration, true);
    assert.deepEqual(service.dependencies, ['dep1', Dep2]);
    assert.equal(service.classz, FilterWithParameters);
  });

  it('should register filter with name as parameter', async function () {
    // given
    let filter: FilterInfo = FilterHelper.getDeclaredFilter(FilterWithNameAsParameter);
    let service: ServiceInfo = ServiceHelper.getDeclaredService(FilterWithNameAsParameter);

    // then
    assert.equal(filter.name, 'namedFilter');
    assert.equal(filter.classz, FilterWithNameAsParameter);

    assert.equal(service.name, 'namedFilter');
    assert.equal(service.skipParentRegistration, null);
    assert.equal(service.dependencies, null);
    assert.equal(service.classz, FilterWithNameAsParameter);
  });

  @Filter
  class FilterWithoutParameters {
  }

  class Dep2 {
  }

  @Filter({name: 'testFilter', skipParentRegistration: true, dependencies: ['dep1', Dep2]})
  class FilterWithParameters {
  }

  @Filter('namedFilter')
  class FilterWithNameAsParameter {
  }

});