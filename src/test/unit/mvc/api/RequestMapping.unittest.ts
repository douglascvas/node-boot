'use strict';

import * as Sinon from "sinon";
import * as chai from "chai";
import {MvcHelper, RequestMapping} from "../../../../main/mvc/api/RequestMapping";
import SinonSpy = Sinon.SinonSpy;
import SinonStub = Sinon.SinonStub;
import {RequestType} from "../../../../main/mvc/api/RequestType";
import {ApiInfo} from "../../../../main/mvc/api/ApiInfo";

const assert = chai.assert;

describe('RequestMapping', function () {

  beforeEach(() => {

  });

  describe('# @RequestMapping', function () {
    it('should register api', async function () {
      // given
      let apis: ApiInfo[] = MvcHelper.getApis(TestClass);

      // then
      assert.equal(apis.length, 2);
      assert.equal(apis[0].uri, '/anyPostApi');
      assert.equal(apis[0].type, RequestType.POST);
      assert.equal(apis[0].classz, TestClass);
      assert.equal(apis[0].fn(null, null), 1);

      assert.equal(apis[1].uri, '/anyGetApi');
      assert.equal(apis[1].type, RequestType.GET);
      assert.equal(apis[1].classz, TestClass);
      assert.equal(apis[1].fn(null, null), 2);
    });
  });

  class TestClass {
    @RequestMapping({uri: '/anyPostApi', type: RequestType.POST})
    public postApi() {
      return 1;
    }

    @RequestMapping({uri: '/anyGetApi', type: RequestType.GET})
    public getApi() {
      return 2;
    }
  }

});