'use strict';

import * as chai from "chai";
import {RequestType} from "../../../../main/web/api/RequestType";
import {ApiInfo} from "../../../../main/web/api/ApiInfo";
import {ClassMetadata} from "../../../../main/core/ClassMetadata";
import {RequestMapping, RequestMappingAnnotation} from "../../../../main/web/api/RequestMappingAnnotation";

const assert = chai.assert;

describe('RequestMappingAnnotation', function () {

  beforeEach(() => {
  });

  describe('# @RequestMapping', function () {
    it('should register api', async function () {
      // given
      let classMetadata = ClassMetadata.getOrCreateClassMetadata(TestClass);
      let apis: ApiInfo[] = classMetadata.getMethodAnnotations(RequestMappingAnnotation.className)
        .map((a: RequestMappingAnnotation) => a.apiInfo);

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
    public postApi(req, res) {
      return 1;
    }

    @RequestMapping({uri: '/anyGetApi', type: RequestType.GET})
    public getApi(req, res) {
      return 2;
    }
  }

});