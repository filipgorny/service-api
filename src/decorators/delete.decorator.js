"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delete = Delete;
const method_type_1 = require("@/method/method-type");
const method_decorator_1 = require("./method.decorator");
/**
 * Decorator for DELETE operations
 * @param path - Optional path for the endpoint (auto-generated from method name if not provided)
 *
 * @example
 * @Delete('/users/:id')
 * async deleteUser(input: DeleteUserInput): Promise<void> { }
 *
 * @example
 * @Delete() // Auto-generates path as 'delete-user'
 * async deleteUser(input: DeleteUserInput): Promise<void> { }
 */
function Delete(path) {
    return (0, method_decorator_1.Method)(method_type_1.MethodType.DELETE, path);
}
