import {DependencyManager} from "../dependencyManager/DependencyManager";

export interface ClassProcessor {
  processClass(classz: Function, dependencyManager: DependencyManager): Promise<void>;

  onApplicationLoad(dependencyManager: DependencyManager): Promise<void>;
}