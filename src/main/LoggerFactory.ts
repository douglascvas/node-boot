'use strict';

import {Logger} from "./Logger";

export interface LoggerFactory {
  getLogger(reference: string|Function): Logger;
}
