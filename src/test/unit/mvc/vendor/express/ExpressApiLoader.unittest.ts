'use strict';

import * as Sinon from "sinon";
import * as chai from "chai";
import {ExpressApiLoader} from "../../../../../main/web/vendor/express/ExpressApiLoader";
import {DependencyManager} from "../../../../../main/di/DependencyManager";
import {LoggerFactory} from "../../../../../main/logging/LoggerFactory";
import {DefaultDependencyManager} from "../../../../../main/di/DefaultDependencyManager";
import {TestLoggerFactory} from "../../../TestLoggerFactory";
import {Controller} from "../../../../../main/web/controller/ControllerAnnotation";
import {RequestMapping} from "../../../../../main/web/api/RequestMappingAnnotation";
import {RequestType} from "../../../../../main/web/api/RequestType";
import {BasicFilter} from "../../../../../main/web/filter/BasicFilter";
import SinonStub = Sinon.SinonStub;

const assert = chai.assert;

describe('ExpressApiLoader', function () {

  let expressApiLoader: ExpressApiLoader,
    dependencyManager: DependencyManager,
    expressApp: any,
    loggerFactory: LoggerFactory;

  beforeEach(() => {
    dependencyManager = Sinon.createStubInstance(DefaultDependencyManager);
    expressApp = {
      'post': Sinon.stub(),
      'put': Sinon.stub()
    };
    loggerFactory = new TestLoggerFactory();
    expressApiLoader = ExpressApiLoader.Builder(expressApp).withLoggerFactory(loggerFactory).build();
  });

  describe('#loadApis()', function () {
    it('should load an API to be registered later', async function () {
      // when
      expressApiLoader.loadApiInfo(TestClassWithName);

      // then
      assert.equal((<any>expressApiLoader)._endpoints.length, 2);
      assert.equal((<any>expressApiLoader)._endpoints[0].apiInfo.uri, '/newApi');
      assert.equal((<any>expressApiLoader)._endpoints[0].controllerInfo.uri, '/test');
    });
  });

  describe('#registerApis()', function () {
    it('should register all apis', async function () {
      // given
      let controller: TestClassWithName = new TestClassWithName();
      (<SinonStub>dependencyManager.findOne).withArgs('TestClassName').returns(controller);
      (<SinonStub>dependencyManager.findOne).withArgs(TestFilter).returns(new TestFilter());
      expressApiLoader.loadApiInfo(TestClassWithName);

      // when
      await expressApiLoader.registerApis(dependencyManager);

      // then
      assert.isTrue((<SinonStub>expressApp['post']).calledWith('/test/newApi'));
    });

    it('should register filter', async function () {
      // given
      let controller: TestClassWithName = new TestClassWithName();
      let testFilter: BasicFilter = <any>new TestFilter();
      (<SinonStub>dependencyManager.findOne).withArgs(TestFilter).returns(testFilter);
      (<SinonStub>dependencyManager.findOne).withArgs('TestClassName').returns(controller);
      expressApiLoader.loadApiInfo(TestClassWithName);

      // when
      await expressApiLoader.registerApis(dependencyManager);

      // then
      let args = (<SinonStub>expressApp['put']).args[0];
      let uri = args[0];
      let filter = <any>args[1];
      let handler = <any>args[2];

      assert.strictEqual(await handler(), 2);
      assert.strictEqual(await filter(), 3);
      assert.strictEqual(uri, '/test/newFilteredApi');
    });
  });

  class TestFilter implements BasicFilter {
    public async filter(request: Request, response: Response, next: Function): Promise<any> {
      return 3;
    }
  }

  @Controller({uri: '/test', name: 'TestClassName'})
  class TestClassWithName {
    @RequestMapping({uri: '/newApi', type: RequestType.POST})
    public async foo(req, res) {
      return 1;
    }

    @RequestMapping({uri: '/newFilteredApi', type: RequestType.PUT, filters: [TestFilter]})
    public async filteredFoo(req, res) {
      return 2;
    }
  }

});