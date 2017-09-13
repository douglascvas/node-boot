import {RequestType} from "./RequestType";
import {BasicFilter} from "../filter/BasicFilter";

export interface ApiInfo {
  uri: string;
  type: RequestType;
  fn: (req: any, res: any, next?: any) => any;
  filters: ((typeof BasicFilter) | string)[],
  classz: any;
}