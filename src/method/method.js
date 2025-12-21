"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Method = void 0;
// Class defining the structure of an API method with runtime type information
class Method {
    constructor(configOrType, name, handler, description, inputClass, outputClass) {
        // Check if first argument is MethodConfig
        if (typeof configOrType === "object" && "handler" in configOrType) {
            const config = configOrType;
            this.type = config.type;
            this.name = config.name;
            this.handler = config.handler;
            this.description = config.description;
            this.inputClass = config.inputClass;
            this.outputClass = config.outputClass;
            this.guard = config.guard;
        }
        else {
            // Legacy constructor call
            this.type = configOrType;
            this.name = name;
            this.handler = handler;
            this.description = description;
            this.inputClass = inputClass;
            this.outputClass = outputClass;
        }
    }
}
exports.Method = Method;
