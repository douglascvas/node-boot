export interface FactoryInfo {
  factoryFn: Function,
  name?: string,
  dependencies?: (string | Function)[],
  context?: (string | Function)
}
