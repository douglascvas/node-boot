export abstract class CalculationService {
  abstract sum(value1: number, value2: number): Promise<number>;
}