'use strict';

import * as chai from "chai";
import {InjectableInfo} from "../../../../main/di/injectable/InjectableInfo";
import {Injectable, InjectableAnnotation} from "../../../../main/di/injectable/InjectableAnnotation";
import {ClassMetadata} from "../../../../main/core/ClassMetadata";

const assert = chai.assert;

describe('InjectableAnnotation', function () {

  it('should register injectable with NodeBootInterface as parameter', async function () {
    // when
    let injectableInfo: InjectableInfo = (<InjectableAnnotation>ClassMetadata.getOrCreateClassMetadata(ServiceWithInterface)
      .getClassAnnotation(InjectableAnnotation.className)).injectableInfo;

    // then
    assert.equal(injectableInfo.name, 'AbstractService');
    assert.equal(injectableInfo.dependencies, null);
    assert.equal(injectableInfo.classz, ServiceWithInterface);
  });

  it('should register injectable without parameters', async function () {
    // when
    let injectableInfo: InjectableInfo = (<InjectableAnnotation>ClassMetadata.getOrCreateClassMetadata(ServiceWithoutParameters)
      .getClassAnnotation(InjectableAnnotation.className)).injectableInfo;

    // then
    assert.equal(injectableInfo.name, null);
    assert.equal(injectableInfo.dependencies, null);
    assert.equal(injectableInfo.classz, ServiceWithoutParameters);
  });

  it('should register injectable with parameters', async function () {
    // given
    let injectableInfo: InjectableInfo = (<InjectableAnnotation>ClassMetadata.getOrCreateClassMetadata(ServiceWithParameters)
      .getClassAnnotation(InjectableAnnotation.className)).injectableInfo;

    // then
    assert.equal(injectableInfo.name, 'testService');
    assert.deepEqual(injectableInfo.dependencies, ['dep1', Dep2]);
    assert.equal(injectableInfo.classz, ServiceWithParameters);
  });

  it('should register injectable with name as parameter', async function () {
    // when
    let injectableInfo: InjectableInfo = (<InjectableAnnotation>ClassMetadata.getOrCreateClassMetadata(ServiceWithNameAsParameter)
      .getClassAnnotation(InjectableAnnotation.className)).injectableInfo;

    // then
    assert.equal(injectableInfo.name, 'namedService');
    assert.equal(injectableInfo.dependencies, null);
    assert.equal(injectableInfo.classz, ServiceWithNameAsParameter);
  });

  class Dep2 {
  }

  @InjectableInterface
  abstract class AbstractService {
  }

  @Injectable({name: 'testService', dependencies: ['dep1', Dep2]})
  class ServiceWithParameters {
  }

  @Injectable
  class ServiceWithoutParameters {
  }

  @Injectable(AbstractService)
  class ServiceWithInterface implements AbstractService {
  }

  @Injectable('namedService')
  class ServiceWithNameAsParameter {
  }

});