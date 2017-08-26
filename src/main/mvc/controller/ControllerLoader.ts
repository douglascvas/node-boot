import {DependencyManager} from "../../dependencyManager/DependencyManager";

export interface ControllerLoader {
  checkAndRegisterController(classz: Function, dependencyManager: DependencyManager);
}