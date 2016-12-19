'use strict';
require("reflect-metadata");
class ObjectUtils {
    static *toIterable(value) {
        if (value instanceof Array) {
            for (let i = 0; i < value.length; i++) {
                yield value[i];
            }
            return;
        }
        if (typeof value === 'object') {
            let keys = Object.keys[value];
            for (let key of Reflect.ownKeys(value)) {
                yield { key: key, value: value[key] };
            }
        }
    }
    static extractClassName(classz) {
        let asString = classz.toString();
        if (asString === '[object]') {
            asString = classz.constructor.toString();
        }
        let match = asString.match(/(?:function|class)[\s]*(\w+).*(\(|\{)/);
        if (!match) {
            console.log('The class must specify a name.', classz);
            return null;
        }
        return match[1];
    }
    static isClass(classz) {
        return classz.toString().indexOf('class') === 0;
    }
    static extractArgs(classz) {
        let regexStr = '\\(([^)]*)\\)';
        if (this.isClass(classz)) {
            regexStr = 'constructor[ ]*' + regexStr;
        }
        let match = classz.toString().match(new RegExp(regexStr));
        if (!match) {
            return [];
        }
        return match[1]
            .split(',')
            .map(name => name.trim()).filter((value, index, array) => !!value);
    }
    static toInstanceName(name) {
        return name.replace(/^./, name[0].toLowerCase());
    }
}
exports.ObjectUtils = ObjectUtils;

//# sourceMappingURL=objectUtils.js.map
