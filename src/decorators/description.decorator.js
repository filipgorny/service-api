"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Description = Description;
require("reflect-metadata");
const controller_metadata_1 = require("@/controller/controller-metadata");
/**
 * Decorator to add a description to an API method
 * @param description - Human-readable description of the method
 *
 * @example
 * @Get('/users/:id')
 * @Description('Get user by ID')
 * async getUserById(input: GetUserInput): Promise<UserOutput> { }
 */
function Description(description) {
    return (target, propertyKey) => {
        Reflect.defineMetadata(controller_metadata_1.DESCRIPTION_METADATA, description, target, propertyKey);
    };
}
