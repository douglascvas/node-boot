import {ServiceInfo} from "../../di/service/ServiceInfo";

export interface ControllerInfo extends ServiceInfo {
  uri: string,
}