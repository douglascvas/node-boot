import {ClassType} from "../ClassType";

export abstract class Metadata {
  public readonly targetClass: ClassType;

  constructor(targetClass) {
    this.targetClass = targetClass;
  }
}