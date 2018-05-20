'use strict';
import {InjectableInfo} from "./injectable/InjectableInfo";
import {FactoryInfo} from "./factory/FactoryInfo";
import {ClassType} from "../ClassType";

export interface DependencyManager {
  value(name: string, value: any): Promise<void>;

  injectable?(injectableInfo: InjectableInfo): Promise<void>;

  service?(injectableInfo: InjectableInfo): Promise<void>;

  factory(factoryInfo: FactoryInfo): Promise<void>;

  findOne(name: string | ClassType): Promise<any>;
}