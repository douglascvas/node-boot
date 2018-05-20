import {GreetingService} from "./GreetingService";
import {TestCalculationService} from "./TestCalculationService";
import {Factory} from "../..";
import * as express from "express";

export class TestServer {

  constructor(private _greetingService: GreetingService,
              private _calculationService: TestCalculationService) {
  }

  @Factory({name: 'app'})
  public createExpressApp(): any{
    return express();
  }

  public greet(name) {
    return this._greetingService.greet(name);
  }

  public sum(value1: number, value2: number): Promise<number> {
    return this._calculationService.sum(value1, value2);
  }
}