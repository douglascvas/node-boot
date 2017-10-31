export abstract class JsObject {
  public get className() {
    return Reflect.getPrototypeOf(this).constructor.name;
  }

  public static get className() {
    return this.name
  }
}
