import {ClassInfo} from "./ClassInfo";
import {ModuleContext} from "./ModuleContext";

export interface ApplicationModule {
  provideClasses(): Promise<ClassInfo[]>;

  processClasses(classes: ClassInfo[]): Promise<void>;

  initialize(application: ModuleContext): Promise<void>;

  applicationLoaded(): Promise<void>;
}