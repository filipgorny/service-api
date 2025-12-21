"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MethodsCollection = void 0;
// Collection of API methods with iterator support
class MethodsCollection {
    constructor() {
        this.methods = [];
    }
    add(method) {
        this.methods.push(method);
    }
    getAll() {
        return [...this.methods];
    }
    count() {
        return this.methods.length;
    }
    // Iterator implementation
    [Symbol.iterator]() {
        let index = 0;
        const methods = this.methods;
        return {
            next() {
                if (index < methods.length) {
                    return {
                        value: methods[index++],
                        done: false,
                    };
                }
                else {
                    return {
                        value: undefined,
                        done: true,
                    };
                }
            },
        };
    }
}
exports.MethodsCollection = MethodsCollection;
