import {InjectableInterface} from "../../main/core/InjectableInterface";

export abstract class CalculationService extends InjectableInterface {
  abstract sum(value1: number, value2: number): Promise<number>;
}