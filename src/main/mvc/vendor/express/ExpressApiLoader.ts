import {DependencyManager} from "../../../dependencyManager/DependencyManager";
import {LoggerFactory} from "../../../logging/LoggerFactory";
import {Logger} from "../../../logging/Logger";
import {ObjectUtils} from "../../../ObjectUtils";
import {ConsoleLoggerFactory} from "../../../logging/ConsoleLoggerFactory";
import {ApiInfo} from "../../api/ApiInfo";
import {MvcHelper} from "../../api/RequestMapping";
import {ApiLoader} from "../../api/ApiLoader";
import {ControllerInfo} from "../../controller/ControllerInfo";
import {ControllerHelper} from "../../controller/Controller";
import {BasicFilter} from "../../filter/BasicFilter";
import {FilterHelper} from "../../filter/Filter";
import {FilterInfo} from "../../filter/FilterInfo";

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

  constructor(expressApp: any, loggerFactory?: LoggerFactory) {
    loggerFactory = loggerFactory || new ConsoleLoggerFactory();
    this._logger = loggerFactory.getLogger(ExpressApiLoader);
    this._endpoints = [];
    this._expressApp = expressApp;
  }

  public loadApiInfo(classz: Function) {
    let controllerInfo: ControllerInfo = ControllerHelper.getDeclaredController(classz);
    let apisInClass: EndpointInfo[] = MvcHelper.getApis(classz).map(apiInfo => ({
      apiInfo: apiInfo,
      controllerInfo: controllerInfo || {
        uri: '',
        name: ObjectUtils.extractClassName(apiInfo.classz),
        filters: [],
        registerParent: true,
        classz: apiInfo.classz
      }
    }));
    this._endpoints = this._endpoints.concat(apisInClass);
  }

  public async registerApis(dependencyManager: DependencyManager) {
    for (let endpointInfo of this._endpoints) {
      let instance: any = await dependencyManager.findOne(endpointInfo.controllerInfo.name || endpointInfo.controllerInfo.classz) || null;
      await this.registerApi(endpointInfo.apiInfo, instance, endpointInfo.controllerInfo, dependencyManager);
    }
  }

  private async resolveFilters(filters: (typeof BasicFilter | string)[], dependencyManager: DependencyManager) {
    let filtersPromise = filters.map(async f => {
      let filterName = f;
      if (typeof f !== 'string') {
        let filterInfo: FilterInfo = FilterHelper.getDeclaredFilter(f);
        filterName = (filterInfo && filterInfo.name) || f;
      }
      let instance: BasicFilter = await dependencyManager.findOne(filterName);
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