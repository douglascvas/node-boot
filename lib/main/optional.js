"use strict";
function requireNotNull(value) {
    if (value == null) {
        throw new Error("Value must not be null");
    }
    return value;
}
class Optional {
    constructor(value) {
        this.value = value;
        this.value = value;
    }
    static of(value) {
        return new Optional(requireNotNull(value));
    }
    static ofNullable(value) {
        return new Optional(value);
    }
    isPresent() {
        return this.value !== null && this.value !== undefined;
    }
    static empty() {
        return new Optional(null);
    }
    orElse(value) {
        return value != null ? value : this.value;
    }
    get() {
        if (this.value == null) {
            throw new Error("No value present");
        }
        return this.value;
    }
}
exports.Optional = Optional;

//# sourceMappingURL=optional.js.map
