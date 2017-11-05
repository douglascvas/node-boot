import {ApplicationManager} from "./ApplicationManager";

export interface ApplicationModule {
  initialize(application: ApplicationManager): Promise<void>;
}