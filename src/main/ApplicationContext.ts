import {DependencyManager} from "./di/DependencyManager";

export interface ApplicationContext {
  readonly mainApplicationInstance: any;
  readonly applicationConfig: Object;
  readonly dependencyManager: DependencyManager;
}