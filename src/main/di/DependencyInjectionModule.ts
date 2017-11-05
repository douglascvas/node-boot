import {DependencyManager} from "./DependencyManager";
import {ApplicationModule} from "../ApplicationModule";

export interface DependencyInjectionModule extends ApplicationModule {
  readonly dependencyManager: DependencyManager;
}


