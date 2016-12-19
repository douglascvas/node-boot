"use strict";
class ExpressWebManager {
    constructor(expressApp, loggerFactory) {
        this.expressApp = expressApp;
        this.loggerFactory = loggerFactory;
        if (loggerFactory) {
            this.logger = loggerFactory.getLogger(ExpressWebManager);
        }
        this.router = expressApp.Router();
    }
    registerApi(endpointInfo, classInstance) {
        let method = endpointInfo.type.value;
        if (this.logger) {
            this.logger.debug(`Registering api - ${method.toUpperCase()} ${endpointInfo.path}.`);
        }
        this.router[method](endpointInfo.path, endpointInfo.callback.bind(classInstance));
    }
}
exports.ExpressWebManager = ExpressWebManager;

//# sourceMappingURL=expressWebManager.js.map
