import {ClassType} from "../../ClassType";

export interface ServiceInfo {
  classz: ClassType;
  name?: string;
  skipParentRegistration?: boolean;
  dependencies?: (string | Function)[];
}