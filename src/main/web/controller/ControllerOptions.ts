import {ServiceOptions} from "../../di/service/ServiceOptions";

export interface ControllerOptions extends ServiceOptions {
  uri?: string
}