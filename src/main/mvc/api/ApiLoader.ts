import {DependencyManager} from "../../dependencyManager/DependencyManager";

export interface ApiLoader {
  loadApiInfo(classz: Function);
  registerApis(dependencyManager: DependencyManager);
}