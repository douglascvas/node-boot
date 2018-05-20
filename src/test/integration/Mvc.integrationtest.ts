'use strict';

import * as chai from "chai";
import {TestServer} from "../demo/TestServer";
import {TestApplication} from "../demo/TestApplication";
import * as request from "supertest";
import {ApplicationContext} from "../../main/ApplicationContext";

const assert = chai.assert;

describe('MVC test', function () {

  let server: TestServer,
    applicationContext: ApplicationContext,
    expressApp: any,
    testApplication: TestApplication;

  before(async () => {
    testApplication = new TestApplication();
    applicationContext = await testApplication.start();
    testApplication = applicationContext.mainApplicationInstance;
    expressApp = await applicationContext.dependencyManager.findOne('app');
  });

  it('should register GET api', async () => {
    // when
    let result = await request.agent(expressApp).get('/calculation/add/2/5');

    // then
    assert.equal(result.text, '7');
  });

  it('should register POST api', async () => {
    // when
    let result = await request.agent(expressApp).post('/calculation/add-positive/10/50');

    // then
    assert.equal(result.text, '60');
  });

  it('should use filter to transform parameters api', async () => {
    // when
    let result = await request.agent(expressApp).post('/calculation/add-positive/-5/8');

    // then
    assert.equal(result.text, '8');
  });

});