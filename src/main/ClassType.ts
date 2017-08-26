export class ClassType {
  static SERVICE = new ClassType('service');
  static FACTORY = new ClassType('factory');
  static CLASS = new ClassType('class');

  constructor(private _value) {
  }

  get value() {
    return this._value;
  }

  public equals(type: ClassType) {
    return type.value === this.value;
  }
}

export default ClassType;