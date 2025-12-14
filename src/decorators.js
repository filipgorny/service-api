"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Guard = exports.Description = exports.Delete = exports.Put = exports.Post = exports.Get = exports.Method = exports.Controller = void 0;
exports.Describe = Describe;
// Import reflect-metadata to enable metadata reflection for decorators
require("reflect-metadata");
// Re-export all decorators for controller support
var controller_decorator_1 = require("./decorators/controller.decorator");
Object.defineProperty(exports, "Controller", { enumerable: true, get: function () { return controller_decorator_1.Controller; } });
var method_decorator_1 = require("./decorators/method.decorator");
Object.defineProperty(exports, "Method", { enumerable: true, get: function () { return method_decorator_1.Method; } });
var get_decorator_1 = require("./decorators/get.decorator");
Object.defineProperty(exports, "Get", { enumerable: true, get: function () { return get_decorator_1.Get; } });
var post_decorator_1 = require("./decorators/post.decorator");
Object.defineProperty(exports, "Post", { enumerable: true, get: function () { return post_decorator_1.Post; } });
var put_decorator_1 = require("./decorators/put.decorator");
Object.defineProperty(exports, "Put", { enumerable: true, get: function () { return put_decorator_1.Put; } });
var delete_decorator_1 = require("./decorators/delete.decorator");
Object.defineProperty(exports, "Delete", { enumerable: true, get: function () { return delete_decorator_1.Delete; } });
var description_decorator_1 = require("./decorators/description.decorator");
Object.defineProperty(exports, "Description", { enumerable: true, get: function () { return description_decorator_1.Description; } });
var guard_decorator_1 = require("./decorators/guard.decorator");
Object.defineProperty(exports, "Guard", { enumerable: true, get: function () { return guard_decorator_1.Guard; } });
// Legacy decorator - kept for backward compatibility
function Describe(description) {
    return function (target, propertyKey, descriptor) {
        Reflect.defineMetadata("description", description, target, propertyKey);
        return descriptor;
    };
}
