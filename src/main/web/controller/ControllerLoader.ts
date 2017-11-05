import {DependencyManager} from "../../di/DependencyManager";

export interface ControllerLoader {
  checkAndRegisterController(classz: Function, dependencyManager: DependencyManager);
}