import {GreetingService} from "./GreetingService";
import {Service} from "../../main/di/service/ServiceAnnotation";

@Service
export class HelloGreetingService extends GreetingService {
  public greet(name): string {
    return `Hello ${name}!`;
  }
}