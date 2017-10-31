export interface RequiresAuthenticationInfo {
  fn: (req: any, res: any, next?: any) => any;
  classz: any;
}