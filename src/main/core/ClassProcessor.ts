import {ClassType} from "../ClassType";

export interface ClassProcessor {
  processClass(classz: ClassType): Promise<void>;

  onApplicationLoad(): Promise<void>;
}