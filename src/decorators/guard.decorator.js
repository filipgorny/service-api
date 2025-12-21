"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Guard = Guard;
require("reflect-metadata");
const controller_metadata_1 = require("@/controller/controller-metadata");
/**
 * Decorator to protect an API method with a guard
 * @param guardName - Optional name of the guard from registry. If not provided, uses default guard
 *
 * @example
 * // Use named guard
 * @Get('/users/:id')
 * @Guard('jwt')
 * async getUserById(input: GetUserInput): Promise<UserOutput> { }
 *
 * @example
 * // Use default guard
 * @Get('/profile')
 * @Guard()
 * async getProfile(input: GetProfileInput): Promise<UserOutput> { }
 */
function Guard(guardName) {
    return (target, propertyKey) => {
        // Store guard name (or empty string for default guard)
        const guardValue = guardName !== undefined ? guardName : "";
        Reflect.defineMetadata(controller_metadata_1.GUARD_METADATA, guardValue, target, propertyKey);
    };
}
