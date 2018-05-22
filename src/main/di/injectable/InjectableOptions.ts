export interface InjectableOptions {
  name?: string,
  nameFrom?: Function,
  dependencies?: (string | Function)[]
}