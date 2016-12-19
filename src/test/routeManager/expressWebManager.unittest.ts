'use strict';

import * as sinon from "sinon";
import * as chai from "chai";
import {LoggerFactory, Logger} from "../../main/loggerFactory";
import {EndpointInfo, RequestType} from "../../main/decorator/mvc";
import {ExpressWebManager} from "../../main/webManager/expressWebManager";
import SinonSpy = Sinon.SinonSpy;
import SinonStub = Sinon.SinonStub;

const assert = chai.assert;

describe('ExpressWebManager', function () {

  let expressApp: any;
  let expressRouter: any;
  let loggerFactory: LoggerFactory;
  let expressWebManager: ExpressWebManager;

  beforeEach(() => {
    expressRouter = {get: sinon.stub(), post: sinon.stub()};
    expressApp = {
      Router: function () {
        return expressRouter;
      }
    };
    loggerFactory = <any>sinon.createStubInstance(LoggerFactory);
    (<SinonStub>loggerFactory.getLogger).returns(sinon.createStubInstance(Logger));
    expressWebManager = new ExpressWebManager(expressApp, loggerFactory);
  });

  describe('#registerApi()', function () {
    it('should register a GET api', async function () {
      // given
      let API_PATH = "/test";
      let obj = new TestClass();
      let callback = sinon.spy();
      let endpointInfo: EndpointInfo = {path: API_PATH, type: RequestType.GET, callback: callback};

      // when
      await expressWebManager.registerApi(endpointInfo, obj);

      // then
      assert.isTrue(expressRouter.get.calledWith(API_PATH, sinon.match.any));
      const callbackUsed: SinonSpy = expressRouter.get.args[0][1];
      assert.equal(callback.callCount, 0);
      callbackUsed();
      assert.equal(callback.callCount, 1);
    });

    it('should register a POST api', async function () {
      // given
      let API_PATH = "/test";
      let obj = new TestClass();
      let callback = sinon.spy();
      let endpointInfo: EndpointInfo = {path: API_PATH, type: RequestType.POST, callback: callback};

      // when
      await expressWebManager.registerApi(endpointInfo, obj);

      // then
      assert.isTrue(expressRouter.post.calledWith(API_PATH, sinon.match.any));
      const callbackUsed: SinonSpy = expressRouter.post.args[0][1];
      assert.equal(callback.callCount, 0);
      callbackUsed();
      assert.equal(callback.callCount, 1);
    });
  });

  class TestClass {
  }

});