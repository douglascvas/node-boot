import {LoggerFactory} from "../../main/logging/LoggerFactory";
import {TestLoggerFactory} from "../unit/TestLoggerFactory";
import {TestServer} from "./TestServer";
import * as express from "express";
import {NodeBootApplication} from "../../main/NodeBootApplication";
import {ExpressWebModule} from "../../main/web/vendor/express/ExpressWebModule";

export class TestApplication {
  public expressApp: any;

  constructor() {
    this.expressApp = express();
  }

  public async start(): Promise<TestServer> {
    let loggerFactory: LoggerFactory = new TestLoggerFactory();

    let applicationConfig = {
      nodeBoot: {
        core: {
          autoScan: {
            enabled: true,
            include: [`${__dirname}/**/*.ts`],
            exclude: ['./node_modules/**']
          }
        }
      }
    };

    let webModule = new ExpressWebModule(this.expressApp);
    return await new NodeBootApplication({mainApplicationClass: TestServer, applicationConfig, loggerFactory})
      .useModule(webModule)
      .run();
  }
}

