import {DependencyManager} from "../dependencyManager/DependencyManager";
import {ClassType} from "../ClassType";

export interface ClassProcessor {
  processClass(classz: ClassType, dependencyManager: DependencyManager): Promise<void>;

  onApplicationLoad(dependencyManager: DependencyManager): Promise<void>;
}