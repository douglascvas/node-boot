export interface ServiceOptions {
  name?: string,
  skipParentRegistration?: boolean,
  dependencies?: (string | Function)[]
}