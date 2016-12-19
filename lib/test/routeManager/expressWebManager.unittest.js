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
const mvc_1 = require("../../main/decorator/mvc");
const expressWebManager_1 = require("../../main/webManager/expressWebManager");
const assert = chai.assert;
describe('ExpressWebManager', function () {
    let expressApp;
    let expressRouter;
    let loggerFactory;
    let expressWebManager;
    beforeEach(() => {
        expressRouter = { get: sinon.stub(), post: sinon.stub() };
        expressApp = {
            Router: function () {
                return expressRouter;
            }
        };
        loggerFactory = sinon.createStubInstance(loggerFactory_1.LoggerFactory);
        loggerFactory.getLogger.returns(sinon.createStubInstance(loggerFactory_1.Logger));
        expressWebManager = new expressWebManager_1.ExpressWebManager(expressApp, loggerFactory);
    });
    describe('#registerApi()', function () {
        it('should register a GET api', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let API_PATH = "/test";
                let obj = new TestClass();
                let callback = sinon.spy();
                let endpointInfo = { path: API_PATH, type: mvc_1.RequestType.GET, callback: callback };
                yield expressWebManager.registerApi(endpointInfo, obj);
                assert.isTrue(expressRouter.get.calledWith(API_PATH, sinon.match.any));
                const callbackUsed = expressRouter.get.args[0][1];
                assert.equal(callback.callCount, 0);
                callbackUsed();
                assert.equal(callback.callCount, 1);
            });
        });
        it('should register a POST api', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let API_PATH = "/test";
                let obj = new TestClass();
                let callback = sinon.spy();
                let endpointInfo = { path: API_PATH, type: mvc_1.RequestType.POST, callback: callback };
                yield expressWebManager.registerApi(endpointInfo, obj);
                assert.isTrue(expressRouter.post.calledWith(API_PATH, sinon.match.any));
                const callbackUsed = expressRouter.post.args[0][1];
                assert.equal(callback.callCount, 0);
                callbackUsed();
                assert.equal(callback.callCount, 1);
            });
        });
    });
    class TestClass {
    }
});

//# sourceMappingURL=expressWebManager.unittest.js.map
