'use strict';

import * as sinon from "sinon";
import * as chai from "chai";
import {LoggerFactory, Logger} from "../../main/loggerFactory";
import {ExpressRouterManager} from "../../main/routeManager/expressRouteManager";
import {EndpointInfo, RequestType} from "../../main/decorator/mvc";
import SinonSpy = Sinon.SinonSpy;
import SinonStub = Sinon.SinonStub;

const assert = chai.assert;

describe('ExpressRouteManager', function () {

  let expressRouter: any;
  let loggerFactory: LoggerFactory;
  let expressRouterManager: ExpressRouterManager;

  beforeEach(() => {
    expressRouter = {get: sinon.stub()};
    loggerFactory = <any>sinon.createStubInstance(LoggerFactory);
    (<SinonStub>loggerFactory.getLogger).returns(sinon.createStubInstance(Logger));
    expressRouterManager = new ExpressRouterManager(expressRouter, loggerFactory);
  });

  describe('#registerApi()', function () {
    it('should register a GET api', async function () {
      // given
      let API_PATH = "/test";
      let obj = new TestClass();
      let callback = sinon.spy();
      let endpointInfo: EndpointInfo = {path: API_PATH, type: RequestType.GET, callback: callback};

      // when
      await expressRouterManager.registerApi(endpointInfo, obj);

      // then
      assert.isTrue(expressRouter.get.calledWith(API_PATH, sinon.match.any));
      const callbackUsed: SinonSpy = expressRouter.get.args[0][1];
      assert.equal(callback.callCount, 0);
      callbackUsed();
      assert.equal(callback.callCount, 1);
    });
  });

  class TestClass {
  }

});