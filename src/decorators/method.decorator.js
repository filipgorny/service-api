"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Method = Method;
require("reflect-metadata");
const controller_metadata_1 = require("@/controller/controller-metadata");
/**
 * Base decorator for defining API method endpoints
 * @param type - HTTP method type (GET, CREATE, UPDATE, DELETE)
 * @param path - Optional path for the method (auto-generated from method name if not provided)
 *
 * @example
 * @Method(MethodType.GET, '/users/:id')
 * async getUser(input: GetUserInput): Promise<UserOutput> { }
 */
function Method(type, path) {
    return (target, propertyKey, descriptor) => {
        const metadata = {
            type,
            path,
            propertyKey: propertyKey.toString(),
        };
        // Store method metadata
        Reflect.defineMetadata(controller_metadata_1.METHOD_METADATA, metadata, target, propertyKey);
        return descriptor;
    };
}
