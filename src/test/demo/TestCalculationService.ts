import {CalculationService} from "./CalculationService";
import {Injectable} from "../../main/di/injectable/InjectableAnnotation";

@Injectable({nameFrom: CalculationService})
export class TestCalculationService implements CalculationService {
  public async sum(value1: number, value2: number): Promise<number> {
    return value1 + value2;
  }
}