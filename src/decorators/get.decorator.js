"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Get = Get;
const method_type_1 = require("@/method/method-type");
const method_decorator_1 = require("./method.decorator");
/**
 * Decorator for GET/Read operations
 * @param path - Optional path for the endpoint (auto-generated from method name if not provided)
 *
 * @example
 * @Get('/users/:id')
 * async getUserById(input: GetUserInput): Promise<UserOutput> { }
 *
 * @example
 * @Get() // Auto-generates path as 'get-user-by-id'
 * async getUserById(input: GetUserInput): Promise<UserOutput> { }
 */
function Get(path) {
    return (0, method_decorator_1.Method)(method_type_1.MethodType.GET, path);
}
