'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const glob = require("glob");
const path = require("path");
const objectUtils_1 = require("../objectUtils");
class DefaultModuleScannerService {
    scan(includePaths, excludePaths) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            let classMap = yield this.findClasses(includePaths, excludePaths);
            for (let entry of classMap.entries()) {
                let [key, value] = entry;
                if (typeof value === 'function') {
                    result.push({ name: key, classz: value });
                }
            }
            return result;
        });
    }
    findClasses(includePaths, excludePaths) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = new Map();
            const mainPattern = includePaths.join('|');
            const options = {};
            if (excludePaths && excludePaths.length) {
                options.ignore = excludePaths.join('|');
            }
            let files = yield this.searchFiles(mainPattern, options);
            files.forEach(file => this.extractModuleInfo(file, result));
            return result;
        });
    }
    searchFiles(mainPattern, options) {
        return new Promise((resolve, reject) => {
            glob(mainPattern, options, function (err, files) {
                if (err) {
                    return reject(err);
                }
                return resolve(files);
            });
        });
    }
    extractModuleInfo(file, result) {
        const mod = require(path.resolve(file));
        const entries = objectUtils_1.ObjectUtils.toIterable(mod);
        for (let entry of entries) {
            result.set(entry.key, entry.value);
        }
    }
}
exports.DefaultModuleScannerService = DefaultModuleScannerService;

//# sourceMappingURL=defaultModuleScannerService.js.map
