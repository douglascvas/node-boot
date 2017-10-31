import {DependencyManager} from "../../../dependencyManager/DependencyManager";
import {LoggerFactory} from "../../../logging/LoggerFactory";
import {Logger} from "../../../logging/Logger";
import {ObjectUtils} from "../../../ObjectUtils";
import {ConsoleLoggerFactory} from "../../../logging/ConsoleLoggerFactory";
import {ApiInfo} from "../../api/ApiInfo";
import {ApiLoader} from "../../api/ApiLoader";
import {ControllerInfo} from "../../controller/ControllerInfo";
import {BasicFilter, BasicFilterType} from "../../filter/BasicFilter";
import {ClassMetadata} from "../../../core/ClassMetadata";
import {ClassType} from "../../../ClassType";
import {ControllerAnnotation} from "../../controller/ControllerAnnotation";
import {RequestMappingAnnotation} from "../../api/RequestMappingAnnotation";

interface EndpointInfo {
  apiInfo: ApiInfo,
  controllerInfo: ControllerInfo
}

/**
 * Register the APIs of a class into Express.
 * This class also makes use of the information contained in the controller metadata.
 */
export class ExpressApiLoader implements ApiLoader {
  private _logger: Logger;
  private _endpoints: EndpointInfo[];
  private _expressApp: any;

  constructor(builder: ExpressApiLoaderBuilder) {
    let loggerFactory = builder.loggerFactory || new ConsoleLoggerFactory();
    this._logger = loggerFactory.getLogger(ExpressApiLoader);
    this._endpoints = [];
    this._expressApp = builder.expressApp;
  }

  public loadApiInfo(classz: ClassType) {
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

  public async registerApis(dependencyManager: DependencyManager) {
    for (let endpointInfo of this._endpoints) {
      let instance: any = await dependencyManager.findOne(endpointInfo.controllerInfo.name || endpointInfo.controllerInfo.classz) || null;
      await this.registerApi(endpointInfo.apiInfo, instance, endpointInfo.controllerInfo, dependencyManager);
    }
  }

  public static Builder(expressApp: any) {
    return new ExpressApiLoaderBuilder(expressApp);
  }

  private async resolveFilters(filters: (BasicFilterType | string)[], dependencyManager: DependencyManager) {
    let filtersPromise = filters.map(async f => {
      let instance: BasicFilter = await dependencyManager.findOne(<ClassType | string>f);
      return instance.filter.bind(instance);
    });
    return Promise.all(filtersPromise);
  }

  private async registerApi(apiInfo: ApiInfo, classInstance: any,
                            controllerInfo: ControllerInfo,
                            dependencyManager: DependencyManager): Promise<void> {
    let controllerUri = controllerInfo.uri || '';

    let method = apiInfo.type.value || 'get';
    if (this._logger) {
      this._logger.debug(`Registering api - ${method.toUpperCase()} ${apiInfo.uri}.`);
    }
    let uri = this.concatUris(controllerUri, apiInfo.uri);
    let filters = await this.resolveFilters(apiInfo.filters, dependencyManager);
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

export class ExpressApiLoaderBuilder {
  private _expressApp: any;
  private _loggerFactory: LoggerFactory;

  constructor(expressApp: any) {
    this._expressApp = expressApp;
  }

  public withLoggerFactory(loggerFactory: LoggerFactory): ExpressApiLoaderBuilder {
    this._loggerFactory = loggerFactory;
    return this;
  }

  public get expressApp(): any {
    return this._expressApp;
  }

  public get loggerFactory(): LoggerFactory {
    return this._loggerFactory;
  }

  public build() {
    return new ExpressApiLoader(this);
  }
}

