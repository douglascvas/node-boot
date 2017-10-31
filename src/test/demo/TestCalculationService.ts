import {CalculationService} from "./CalculationService";
import {Service} from "../../main/dependencyManager/service/ServiceAnnotation";

@Service
export class TestCalculationService extends CalculationService {
  public async sum(value1: number, value2: number): Promise<number> {
    return value1 + value2;
  }
}