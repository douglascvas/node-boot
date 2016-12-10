'use strict';

import {ObjectUtils} from "./objectUtils";

const log4js = require("log4js");

export class LoggerFactory {
  constructor(private loggerConfig: any = {}) {
    (<any>log4js).configure(loggerConfig);
  }

  public getLogger(reference: string|Function): Logger {
    if (typeof reference !== 'string') {
      reference = ObjectUtils.extractClassName(<Function>reference);
    }
    return new Logger(log4js.getLogger(reference));
  };
}

export class Logger {
  constructor(private _logger) {
  }

  public log(...args: String[]) {
    this._logger.debugLog.apply(this._logger, this._toArray(arguments));
  }

  public info(...args: String[]) {
    this._logger.info.apply(this._logger, this._toArray(arguments));
  }

  public error(...args: String[]) {
    this._logger.error.apply(this._logger, this._toArray(arguments));
  }

  public warn(...args: String[]) {
    this._logger.warn.apply(this._logger, this._toArray(arguments));
  }

  public debug(...args: any[]) {
    this._logger.debug.apply(this._logger, this._toArray(arguments));
  }

  private _toArray(args: IArguments): any[] {
    return Array.prototype.slice.apply(args);
  }

}