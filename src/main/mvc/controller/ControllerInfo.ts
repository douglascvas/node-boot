import {ServiceInfo} from "../../dependencyManager/service/ServiceInfo";

export interface ControllerInfo extends ServiceInfo {
  uri: string,
}