'use strict';
import {ServiceInfo} from "./service/ServiceInfo";
import {FactoryInfo} from "./factory/FactoryInfo";
import {ClassType} from "../ClassType";

export interface DependencyManager {
  value(name: string, value: any): Promise<void>;

  service(serviceInfo: ServiceInfo): Promise<void>;

  factory(factoryInfo: FactoryInfo): Promise<void>;

  findOne(name: string | ClassType): Promise<any>;

  // findAll(): UnitInfo[];
}