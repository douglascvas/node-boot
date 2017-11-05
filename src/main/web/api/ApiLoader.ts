import {DependencyManager} from "../../di/DependencyManager";

export interface ApiLoader {
  loadApiInfo(classz: Function);
  registerApis(dependencyManager: DependencyManager);
}