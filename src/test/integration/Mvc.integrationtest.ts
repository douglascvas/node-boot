'use strict';

import * as chai from "chai";
import {TestServer} from "../demo/TestServer";
import {TestApplication} from "../demo/TestApplication";
import * as request from "supertest";

const assert = chai.assert;

describe('MVC test', function () {

  let server: TestServer,
    testApplication: TestApplication;

  before(async () => {
    testApplication = new TestApplication();
    server = await testApplication.start();
  });

  it('should register GET api', async () => {
    // when
    let result = await request.agent(testApplication.expressApp).get('/calculation/add/2/5');

    // then
    assert.equal(result.text, '7');
  });

  it('should register POST api', async () => {
    // when
    let result = await request.agent(testApplication.expressApp).post('/calculation/add-positive/10/50');

    // then
    assert.equal(result.text, '60');
  });

  it('should use filter to transform parameters api', async () => {
    // when
    let result = await request.agent(testApplication.expressApp).post('/calculation/add-positive/-5/8');

    // then
    assert.equal(result.text, '8');
  });

});