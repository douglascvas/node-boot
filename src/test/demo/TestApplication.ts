import {LoggerFactory} from "../../main/logging/LoggerFactory";
import {TestLoggerFactory} from "../unit/TestLoggerFactory";
import {TestServer} from "./TestServer";
import {ApplicationManager} from "../../main/ApplicationManager";
import * as express from "express";
import {ClassProcessor} from "../../main/core/ClassProcessor";
import ExpressWebManagerClassProcessor from "../../main/mvc/vendor/express/ExpressWebManagerClassProcessor";

export class TestApplication {
  public expressApp: any;

  constructor() {
    this.expressApp = express();
  }

  public async start(): Promise<TestServer> {
    let loggerFactory: LoggerFactory = new TestLoggerFactory();
    let expressWebManagerPlugin: ClassProcessor = ExpressWebManagerClassProcessor.Builder(this.expressApp)
      .withLoggerFactory(loggerFactory)
      .build();

    let applicationManager: ApplicationManager = ApplicationManager.Builder(TestServer)
      .withLoggerFactory(loggerFactory)
      .withClassProcessors(expressWebManagerPlugin)
      .withAutoScan(`${__dirname}/**/*.ts`, './node_modules/**')
      .build();

    await applicationManager.registerValue("app", this.expressApp);
    let server: TestServer = await applicationManager.bootstrap();
    return server;
  }
}
