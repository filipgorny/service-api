"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = Post;
const method_type_1 = require("@/method/method-type");
const method_decorator_1 = require("./method.decorator");
/**
 * Decorator for POST/Create operations
 * @param path - Optional path for the endpoint (auto-generated from method name if not provided)
 *
 * @example
 * @Post('/users')
 * async createUser(input: CreateUserInput): Promise<UserOutput> { }
 *
 * @example
 * @Post() // Auto-generates path as 'create-user'
 * async createUser(input: CreateUserInput): Promise<UserOutput> { }
 */
function Post(path) {
    return (0, method_decorator_1.Method)(method_type_1.MethodType.CREATE, path);
}
