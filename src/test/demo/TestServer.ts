import {GreetingService} from "./GreetingService";
import {TestCalculationService} from "./TestCalculationService";

export class TestServer {

  constructor(public app: any,
              private _greetingService: GreetingService,
              private testCalculationService: TestCalculationService) {
  }

  public greet(name) {
    return this._greetingService.greet(name);
  }

  public sum(value1: number, value2: number): Promise<number> {
    return this.testCalculationService.sum(value1, value2);
  }
}