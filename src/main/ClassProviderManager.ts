import {ClassProvider} from "./core/ClassProvider";
import {ClassInfo} from "./ClassInfo";

export class ClassProviderManager {
  private _classProviders: Set<ClassProvider>;

  constructor() {
    this._classProviders = new Set();
  }

  public registerClassProvider(...classProviders: ClassProvider[]) {
    classProviders.forEach(provider => {
      this._classProviders.add(provider);
    });
  }

  public async provideClasses(): Promise<ClassInfo[]> {
    let resultClasses: ClassInfo[] = [];
    for (let provider of this._classProviders.values()) {
      let classes = await provider.provideClasses();
      resultClasses.push(...classes)
    }
    return resultClasses;
  }
}