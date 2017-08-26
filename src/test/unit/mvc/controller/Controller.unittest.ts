'use strict';

import * as chai from "chai";
import {ControllerHelper, default as Controller} from "../../../../main/mvc/controller/Controller";
import {ControllerInfo} from "../../../../main/mvc/controller/ControllerInfo";
import {ServiceHelper} from "../../../../main/dependencyManager/service/Service";
import {ServiceInfo} from "../../../../main/dependencyManager/service/ServiceInfo";

const assert = chai.assert;

describe('@Controller', function () {

  it('should register controller without parameters', async function () {
    // given
    let controller: ControllerInfo = ControllerHelper.getDeclaredController(ControllerWithoutParameters);
    let service: ServiceInfo = ServiceHelper.getDeclaredService(ControllerWithoutParameters);

    // then
    assert.equal(controller.name, null);
    assert.equal(controller.uri, null);
    assert.equal(controller.classz, ControllerWithoutParameters);

    assert.equal(service.name, null);
    assert.equal(service.skipParentRegistration, null);
    assert.equal(service.classz, ControllerWithoutParameters);
  });

  it('should register controller with parameters', async function () {
    // given
    let controller: ControllerInfo = ControllerHelper.getDeclaredController(ControllerWithParameters);
    let service: ServiceInfo = ServiceHelper.getDeclaredService(ControllerWithParameters);

    // then
    assert.equal(controller.name, 'testController');
    assert.equal(controller.uri, '/base');
    assert.equal(controller.classz, ControllerWithParameters);

    assert.equal(service.name, 'testController');
    assert.equal(service.skipParentRegistration, true);
    assert.equal(service.classz, ControllerWithParameters);
  });

  @Controller
  class ControllerWithoutParameters {
  }

  @Controller({name: 'testController', uri: '/base', skipParentRegistration: true})
  class ControllerWithParameters {
  }

});