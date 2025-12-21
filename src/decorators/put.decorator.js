"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Put = Put;
const method_type_1 = require("@/method/method-type");
const method_decorator_1 = require("./method.decorator");
/**
 * Decorator for PUT/Update operations
 * @param path - Optional path for the endpoint (auto-generated from method name if not provided)
 *
 * @example
 * @Put('/users/:id')
 * async updateUser(input: UpdateUserInput): Promise<UserOutput> { }
 *
 * @example
 * @Put() // Auto-generates path as 'update-user'
 * async updateUser(input: UpdateUserInput): Promise<UserOutput> { }
 */
function Put(path) {
    return (0, method_decorator_1.Method)(method_type_1.MethodType.UPDATE, path);
}
