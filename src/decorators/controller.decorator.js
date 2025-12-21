"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = Controller;
require("reflect-metadata");
const controller_metadata_1 = require("@/controller/controller-metadata");
/**
 * Decorator to mark a class as a controller with a base path
 * @param path - Base path for all methods in this controller
 * @throws Error if path is not provided
 *
 * @example
 * @Controller('/users')
 * class UserController {
 *   // methods here
 * }
 */
function Controller(path) {
    return (target) => {
        if (!path) {
            throw new Error(`Controller decorator requires a path argument. Usage: @Controller('/path')`);
        }
        // Store controller path in metadata
        Reflect.defineMetadata(controller_metadata_1.CONTROLLER_PATH_METADATA, path, target);
    };
}
