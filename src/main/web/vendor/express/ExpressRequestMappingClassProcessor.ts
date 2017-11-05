import {DependencyManager} from "../../../di/DependencyManager";
import {Logger} from "../../../logging/Logger";
import {LoggerFactory} from "../../../logging/LoggerFactory";
import {ClassProcessor} from "../../../core/ClassProcessor";
import {ConsoleLoggerFactory} from "../../../logging/ConsoleLoggerFactory";
import {ControllerInfo} from "../../controller/ControllerInfo";
import {ApiInfo} from "../../api/ApiInfo";
import {ClassType} from "../../../ClassType";
import {ClassMetadata} from "../../../core/ClassMetadata";
import {ControllerAnnotation} from "../../controller/ControllerAnnotation";
import {RequestMappingAnnotation} from "../../api/RequestMappingAnnotation";
import {ObjectUtils} from "../../../ObjectUtils";
import {BasicFilter, BasicFilterType} from "../../filter/BasicFilter";
import {Application} from "express";

interface EndpointInfo {
  apiInfo: ApiInfo,
  controllerInfo: ControllerInfo
}

export class ExpressRequestMappingClassProcessor implements ClassProcessor {
  private _logger: Logger;
  private _endpoints: EndpointInfo[];
  private _expressApp: string | Application;
  private _dependencyManager: DependencyManager;

  constructor(options: ExpressRequestMappingClassProcessorOptions) {
    let loggerFactory: LoggerFactory = options.loggerFactory || new ConsoleLoggerFactory();
    this._logger = loggerFactory.getLogger(ExpressRequestMappingClassProcessor);
    this._dependencyManager = options.dependencyManager;
    this._expressApp = options.expressApp;
  }

  public async processClass(classz: ClassType): Promise<void> {
    await this.loadApiInfo(classz);
  }

  public async onApplicationLoad(): Promise<void> {
    if (typeof this._expressApp === 'string') {
      this._expressApp = await this._dependencyManager.findOne(this._expressApp);
    }
    await this.registerApis();
  }

  private loadApiInfo(classz: ClassType) {
    let classMetadata: ClassMetadata = ClassMetadata.getOrCreateClassMetadata(classz);
    let controllerAnnotation: ControllerAnnotation = classMetadata.getClassAnnotation(ControllerAnnotation.className);
    let controllerInfo: ControllerInfo = controllerAnnotation ? controllerAnnotation.controllerInfo : null;
    let requestMappingAnnotations: RequestMappingAnnotation[] = classMetadata.getMethodAnnotations(RequestMappingAnnotation.className);
    this._endpoints = requestMappingAnnotations.map(rma => ({
      apiInfo: rma.apiInfo,
      controllerInfo: controllerInfo || {
        uri: '',
        name: ObjectUtils.extractClassName(rma.apiInfo.classz),
        filters: [],
        registerParent: true,
        classz: rma.apiInfo.classz
      }
    }));
  }

  private async registerApis() {
    for (let endpointInfo of this._endpoints) {
      let instance: any = await this._dependencyManager.findOne(endpointInfo.controllerInfo.name || endpointInfo.controllerInfo.classz) || null;
      await this.registerApi(endpointInfo.apiInfo, instance, endpointInfo.controllerInfo);
    }
  }

  private async resolveFilters(filters: (BasicFilterType | string)[]) {
    let filtersPromise = filters.map(async f => {
      let instance: BasicFilter = await this._dependencyManager.findOne(<ClassType | string>f);
      return instance.filter.bind(instance);
    });
    return Promise.all(filtersPromise);
  }

  private async registerApi(apiInfo: ApiInfo, classInstance: any, controllerInfo: ControllerInfo): Promise<void> {
    let controllerUri = controllerInfo.uri || '';

    let method = apiInfo.type.value || 'get';
    if (this._logger) {
      this._logger.debug(`Registering api - ${method.toUpperCase()} ${apiInfo.uri}.`);
    }
    let uri = this.concatUris(controllerUri, apiInfo.uri);
    let filters = await this.resolveFilters(apiInfo.filters);
    let handler = apiInfo.fn.bind(classInstance);
    let args: any[] = [uri, ...filters, handler];
    this._expressApp[method].apply(this._expressApp, args)
  }

  private concatUris(uri1: string, uri2: string) {
    uri1 = uri1 || '';
    uri2 = uri2 || '';
    if (uri1[uri1.length - 1] !== '/' && uri2[0] !== '/') {
      return uri1 + '/' + uri2;
    } else if (uri1[uri1.length - 1] === '/' && uri2[0] === '/') {
      return uri1 + uri2.substr(1);
    }
    return uri1 + uri2;
  }

}

export interface ExpressRequestMappingClassProcessorOptions {
  expressApp: string | Application;
  dependencyManager: DependencyManager;
  loggerFactory?: LoggerFactory;
}