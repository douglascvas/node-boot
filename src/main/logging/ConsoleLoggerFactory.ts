'use strict';

import {LoggerFactory} from "./LoggerFactory";
import {ObjectUtils} from "../ObjectUtils";
import {Logger} from "./Logger";
import {ConsoleLogger} from "./ConsoleLogger";

const log4js = require("log4js");

export class ConsoleLoggerFactory implements LoggerFactory {
  constructor(private loggerConfig: any = {}) {
    (<any>log4js).configure(loggerConfig);
  }

  public getLogger(reference: string | Function): Logger {
    let name: string;
    if (typeof reference !== 'string') {
      name = ObjectUtils.extractClassName(<Function>reference);
    } else {
      name = reference;
    }
    return new ConsoleLogger(name);
  };
}