import {ClassProvider} from "./core/ClassProvider";
import {ClassProcessor} from "./core/ClassProcessor";
import {ClassType} from "./ClassType";
import {DependencyManager} from "./di/DependencyManager";

export interface ApplicationManager {
  getApplicationConfig(): Object;

  getMainApplicationClass(): ClassType;

  getDependencyManager(): DependencyManager;

  registerClassProcessor(...classProcessor: ClassProcessor[]): void;

  registerClassProvider(...classProvider: ClassProvider[]): void;
}