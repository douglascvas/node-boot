import {GreetingService} from "./GreetingService";
import {Injectable} from "../../main/di/injectable/InjectableAnnotation";

@Injectable({nameFrom: GreetingService})
export class HelloGreetingService implements GreetingService {
  public greet(name): string {
    return `Hello ${name}!`;
  }
}