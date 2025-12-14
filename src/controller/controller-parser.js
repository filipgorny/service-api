"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerParser = void 0;
require("reflect-metadata");
const camel_to_dash_case_1 = require("@/utils/camel-to-dash-case");
const controller_metadata_1 = require("./controller-metadata");
/**
 * Parser for extracting method configurations from controller classes
 */
class ControllerParser {
    /**
     * Parse a controller class and extract all method configurations
     * @param controllerClass - Controller class decorated with @Controller
     * @param guardRegistry - Map of registered guards by name
     * @param defaultGuard - Optional default guard to use when @Guard() has no argument
     * @returns Array of MethodConfig objects for each decorated method
     * @throws Error if controller doesn't have @Controller decorator or guard is not found
     */
    static parse(controllerClass, guardRegistry, defaultGuard) {
        // 1. Validate that the class has @Controller decorator
        const controllerPath = Reflect.getMetadata(controller_metadata_1.CONTROLLER_PATH_METADATA, controllerClass);
        if (!controllerPath) {
            throw new Error(`Class "${controllerClass.name}" must have @Controller decorator. ` +
                `Usage: @Controller('/path')`);
        }
        // 2. Create controller instance
        const instance = new controllerClass();
        const prototype = Object.getPrototypeOf(instance);
        const methodConfigs = [];
        // 3. Get all property names from the prototype
        const propertyNames = Object.getOwnPropertyNames(prototype);
        // 4. Iterate through all properties
        for (const propertyName of propertyNames) {
            // Skip constructor
            if (propertyName === "constructor")
                continue;
            const method = prototype[propertyName];
            // Skip non-functions
            if (typeof method !== "function")
                continue;
            // 5. Check if method has @Method decorator (or @Get/@Post/etc)
            const methodMeta = Reflect.getMetadata(controller_metadata_1.METHOD_METADATA, prototype, propertyName);
            if (!methodMeta) {
                // Method doesn't have decorator, skip it
                continue;
            }
            // 6. Extract type information using TypeScript reflection
            const paramTypes = Reflect.getMetadata("design:paramtypes", prototype, propertyName);
            const returnType = Reflect.getMetadata("design:returntype", prototype, propertyName);
            // 7. Get optional description from @Description decorator
            const description = Reflect.getMetadata(controller_metadata_1.DESCRIPTION_METADATA, prototype, propertyName);
            // 8. Get guard configuration from @Guard decorator
            const guardMetadata = Reflect.getMetadata(controller_metadata_1.GUARD_METADATA, prototype, propertyName);
            let guard;
            if (guardMetadata !== undefined) {
                if (guardMetadata === "" || guardMetadata === null) {
                    // @Guard() with no argument - use default guard
                    if (!defaultGuard) {
                        throw new Error(`Method "${controllerClass.name}.${propertyName}" uses @Guard() without argument, ` +
                            `but no default guard is registered. Call api.registerDefaultGuard(guard) first.`);
                    }
                    guard = defaultGuard;
                }
                else {
                    // @Guard('name') with named guard
                    guard = guardRegistry.get(guardMetadata);
                    if (!guard) {
                        throw new Error(`Guard "${guardMetadata}" not found in registry for method "${controllerClass.name}.${propertyName}". ` +
                            `Register it with api.registerGuard('${guardMetadata}', guard)`);
                    }
                }
            }
            // 9. Determine final path
            let finalPath = methodMeta.path;
            if (!finalPath) {
                // Auto-generate path from method name (camelCase -> dash-case)
                finalPath = (0, camel_to_dash_case_1.camelToDashCase)(propertyName);
            }
            // 10. Combine controller path with method path
            // Remove trailing slash from controller path
            const cleanControllerPath = controllerPath.replace(/\/$/, "");
            // Ensure method path starts with /
            const cleanMethodPath = finalPath.startsWith("/")
                ? finalPath
                : `/${finalPath}`;
            const fullPath = `${cleanControllerPath}${cleanMethodPath}`;
            // 11. Create MethodConfig
            const config = {
                type: methodMeta.type,
                name: fullPath,
                handler: method.bind(instance),
                description,
                inputClass: paramTypes?.[0],
                outputClass: returnType,
                guard,
            };
            methodConfigs.push(config);
        }
        return methodConfigs;
    }
}
exports.ControllerParser = ControllerParser;
