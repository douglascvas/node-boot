import {ClassType} from "./ClassType";
import {DependencyManager} from "./di/DependencyManager";

export interface ModuleContext {
  readonly applicationConfig: Object;
  readonly mainApplicationClass: ClassType;
  readonly dependencyManager: DependencyManager;
}