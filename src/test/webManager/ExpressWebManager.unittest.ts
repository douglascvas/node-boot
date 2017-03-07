'use strict';

import * as Sinon from "sinon";
import * as chai from "chai";
import {LoggerFactory} from "../../main/LoggerFactory";
import {EndpointInfo, RequestType} from "../../main/decorator/Mvc";
import {ExpressWebManager} from "../../main/webManager/ExpressWebManager";
import {TestLoggerFactory} from "../TestLoggerFactory";
import SinonSpy = Sinon.SinonSpy;
import SinonStub = Sinon.SinonStub;

const assert = chai.assert;

describe('ExpressWebManager', function () {

  let expressApp: any;
  let loggerFactory: LoggerFactory;
  let expressWebManager: ExpressWebManager;

  beforeEach(() => {
    expressApp = {get: Sinon.stub(), post: Sinon.stub()};
    loggerFactory = new TestLoggerFactory();
    expressWebManager = new ExpressWebManager(expressApp, loggerFactory);
  });

  describe('#registerApi()', function () {
    it('should register a GET api', async function () {
      // given
      let API_PATH = "/test";
      let obj = new TestClass();
      let callback = Sinon.spy();
      let endpointInfo: EndpointInfo = {path: API_PATH, type: RequestType.GET, callback: callback};

      // when
      await expressWebManager.registerApi(endpointInfo, obj);

      // then
      assert.isTrue(expressApp.get.calledWith(API_PATH, Sinon.match.any));
      const callbackUsed: SinonSpy = expressApp.get.args[0][1];
      assert.equal(callback.callCount, 0);
      callbackUsed();
      assert.equal(callback.callCount, 1);
    });

    it('should register a POST api', async function () {
      // given
      let API_PATH = "/test";
      let obj = new TestClass();
      let callback = Sinon.spy();
      let endpointInfo: EndpointInfo = {path: API_PATH, type: RequestType.POST, callback: callback};

      // when
      await expressWebManager.registerApi(endpointInfo, obj);

      // then
      assert.isTrue(expressApp.post.calledWith(API_PATH, Sinon.match.any));
      const callbackUsed: SinonSpy = expressApp.post.args[0][1];
      assert.equal(callback.callCount, 0);
      callbackUsed();
      assert.equal(callback.callCount, 1);
    });
  });

  class TestClass {
  }

});