import RequestType from "./RequestType";
import {BasicFilter} from "../filter/BasicFilter";

export interface RequestMappingOptions {
  uri: string;
  type?: RequestType;
  filters?: (typeof BasicFilter)[]
}