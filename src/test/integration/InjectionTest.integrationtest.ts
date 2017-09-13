'use strict';

import * as chai from "chai";
import {TestServer} from "../demo/TestServer";
import {TestApplication} from "../demo/TestApplication";

const assert = chai.assert;

describe('Injection test', function () {

  let server: TestServer,
    testApplication: TestApplication;

  before(async () => {
    testApplication = new TestApplication();
    server = await testApplication.start();
  });

  it('should inject HelloGreetingService in the Server when declared by "interface" name', async () => {
    // when
    let greeting = server.greet("Bob");

    // then
    assert.strictEqual(greeting, "Hello Bob!");
  });

  it('should inject TestCalculationService in the Server when declared by implementation name', async () => {
    // when
    let greeting = server.greet("Bob");

    // then
    assert.strictEqual(greeting, "Hello Bob!");
  });

});