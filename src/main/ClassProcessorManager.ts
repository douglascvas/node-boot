import {ClassProcessor} from "./core/ClassProcessor";
import {ClassInfo} from "./ClassInfo";

export class ClassProcessorManager {
  private _classProcessors: ClassProcessor[];

  constructor() {
    this._classProcessors = [];
  }

  public registerClassProcessor(...classProcessor: ClassProcessor[]): void {
    this._classProcessors.push(...classProcessor);
  }

  public async processClasses(classes: ClassInfo[]) {
    for (let classz of classes) {
      for (let processor of this._classProcessors) {
        await processor.processClass(classz.classz);
      }
    }
  }

  public async triggerApplicationLoaded() {
    for (let processor of this._classProcessors) {
      await processor.onApplicationLoad();
    }
  }
}