import {InjectableInterface} from "../../main/core/InjectableInterface";

export abstract class GreetingService extends InjectableInterface {
  abstract greet(name): string;
}