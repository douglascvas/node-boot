import {ClassType} from "../../ClassType";

export interface InjectableInfo {
  classz: ClassType;
  name?: string;
  dependencies?: (string | Function)[];
}