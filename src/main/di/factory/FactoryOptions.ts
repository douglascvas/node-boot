import {ClassType} from "../../ClassType";

export interface FactoryOptions {
  name?: string,
  dependencies?: (string | ClassType)[]
}