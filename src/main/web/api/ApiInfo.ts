import {RequestType} from "./RequestType";
import {BasicFilterType} from "../filter/BasicFilter";

export interface ApiInfo {
  uri: string;
  type: RequestType;
  fn: (req: any, res: any, next?: any) => any;
  filters: (BasicFilterType | string)[],
  classz: any;
}