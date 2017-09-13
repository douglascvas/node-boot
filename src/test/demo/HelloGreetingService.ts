import {GreetingService} from "./GreetingService";
import {Service} from "../../main/dependencyManager/service/Service";

@Service
export class HelloGreetingService extends GreetingService {
  public greet(name): string {
    return `Hello ${name}!`;
  }
}