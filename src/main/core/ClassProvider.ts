import {ClassInfo} from "../ClassInfo";

export interface ClassProvider {
  provideClasses(): Promise<ClassInfo[]>;
}