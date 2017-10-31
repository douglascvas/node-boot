import {RequestType} from "./RequestType";
import {BasicFilterType} from "../filter/BasicFilter";

export interface RequestMappingOptions {
  uri: string;
  type?: RequestType;
  filters?: BasicFilterType[]
}