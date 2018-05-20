'use strict';

import * as chai from "chai";
import {Controller, ControllerAnnotation} from "../../../../main/web/controller/ControllerAnnotation";
import {ControllerInfo} from "../../../../main/web/controller/ControllerInfo";
import {InjectableInfo} from "../../../../main/di/injectable/InjectableInfo";
import {ClassMetadata} from "../../../../main/core/ClassMetadata";
import {InjectableAnnotation} from "../../../../main/di/injectable/InjectableAnnotation";

const assert = chai.assert;

describe('@ControllerAnnotation', function () {

  it('should register @Controller without parameters', async function () {
    // given
    let classMetadata: ClassMetadata = ClassMetadata.getOrCreateClassMetadata(ControllerWithoutParameters);
    let controller: ControllerInfo = (<ControllerAnnotation>classMetadata.getClassAnnotation(ControllerAnnotation.className)).controllerInfo;
    let service: InjectableInfo = (<InjectableAnnotation>classMetadata.getClassAnnotation(InjectableAnnotation.className)).injectableInfo;

    // then
    assert.equal(controller.name, null);
    assert.equal(controller.uri, null);
    assert.equal(controller.classz, ControllerWithoutParameters);

    assert.equal(service.name, null);
    assert.equal(service.classz, ControllerWithoutParameters);
  });

  it('should register @Controller with parameters', async function () {
    // given
    let classMetadata: ClassMetadata = ClassMetadata.getOrCreateClassMetadata(ControllerWithParameters);
    let controller: ControllerInfo = (<ControllerAnnotation>classMetadata.getClassAnnotation(ControllerAnnotation.className)).controllerInfo;
    let service: InjectableInfo = (<InjectableAnnotation>classMetadata.getClassAnnotation(InjectableAnnotation.className)).injectableInfo;

    // then
    assert.equal(controller.name, 'testController');
    assert.equal(controller.uri, '/base');
    assert.equal(controller.classz, ControllerWithParameters);

    assert.equal(service.name, 'testController');
    assert.equal(service.classz, ControllerWithParameters);
  });

  it('should register @Injectable', async function () {
    // given
    let service: InjectableInfo = (<InjectableAnnotation>ClassMetadata.getOrCreateClassMetadata(ControllerWithParameters)
      .getClassAnnotation(InjectableAnnotation.className)).injectableInfo;

    // then
    assert.equal(service.name, 'testController');
    assert.deepEqual(service.dependencies, ['dep1']);
    assert.equal(service.classz, ControllerWithParameters);
  });

  @Controller
  class ControllerWithoutParameters {
  }

  @Controller({name: 'testController', uri: '/base', dependencies: ['dep1']})
  class ControllerWithParameters {
  }

});