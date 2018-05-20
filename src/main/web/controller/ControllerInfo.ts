import {InjectableInfo} from "../../di/injectable/InjectableInfo";

export interface ControllerInfo extends InjectableInfo {
  uri: string,
}