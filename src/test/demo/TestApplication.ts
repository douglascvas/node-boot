import {LoggerFactory} from "../../main/logging/LoggerFactory";
import {TestLoggerFactory} from "../unit/TestLoggerFactory";
import {TestServer} from "./TestServer";
import {NodeBootApplication} from "../../main/NodeBootApplication";
import {ExpressWebModule} from "../../main/web/vendor/express/ExpressWebModule";
import {ApplicationContext} from "../../main/ApplicationContext";

export class TestApplication {


  constructor() {
  }

  public async start(): Promise<ApplicationContext> {
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

    return await new NodeBootApplication({
      mainApplicationClass: TestServer,
      applicationConfig,
      loggerFactory
    })
      .usingModule(new ExpressWebModule({expressApp: 'app'}))
      .run();
  }
}

