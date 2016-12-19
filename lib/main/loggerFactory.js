'use strict';
const objectUtils_1 = require("./objectUtils");
const log4js = require("log4js");
class LoggerFactory {
    constructor(loggerConfig = {}) {
        this.loggerConfig = loggerConfig;
        log4js.configure(loggerConfig);
    }
    getLogger(reference) {
        if (typeof reference !== 'string') {
            reference = objectUtils_1.ObjectUtils.extractClassName(reference);
        }
        return new Logger(log4js.getLogger(reference));
    }
    ;
}
exports.LoggerFactory = LoggerFactory;
class Logger {
    constructor(_logger) {
        this._logger = _logger;
    }
    log(...args) {
        this._logger.debugLog.apply(this._logger, this._toArray(arguments));
    }
    info(...args) {
        this._logger.info.apply(this._logger, this._toArray(arguments));
    }
    error(...args) {
        this._logger.error.apply(this._logger, this._toArray(arguments));
    }
    warn(...args) {
        this._logger.warn.apply(this._logger, this._toArray(arguments));
    }
    debug(...args) {
        this._logger.debug.apply(this._logger, this._toArray(arguments));
    }
    _toArray(args) {
        return Array.prototype.slice.apply(args);
    }
}
exports.Logger = Logger;

//# sourceMappingURL=loggerFactory.js.map
