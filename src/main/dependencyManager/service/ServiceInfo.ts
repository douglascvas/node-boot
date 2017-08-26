export interface ServiceInfo {
  classz: Function;
  name?: string;
  skipParentRegistration?: boolean;
  dependencies?: (string | Function)[];
}