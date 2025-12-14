"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = exports.ControllerParser = exports.GuardDecorator = exports.Describe = exports.Description = exports.Delete = exports.Put = exports.Post = exports.Get = exports.MethodDecorator = exports.Controller = exports.SchemaBuilder = exports.SchemaView = exports.ExpressStrategy = exports.express = exports.StrategyType = exports.MethodType = exports.MethodsCollection = exports.Method = exports.DocumentationRegistry = exports.RestApi = exports.Api = void 0;
// Import reflect-metadata at the entry point of the library
// This ensures it's available for all decorator metadata operations
require("reflect-metadata");
var api_1 = require("@/api");
Object.defineProperty(exports, "Api", { enumerable: true, get: function () { return api_1.Api; } });
var rest_api_1 = require("@/rest-api");
Object.defineProperty(exports, "RestApi", { enumerable: true, get: function () { return rest_api_1.RestApi; } });
var documentation_registry_1 = require("@/documentation/documentation-registry");
Object.defineProperty(exports, "DocumentationRegistry", { enumerable: true, get: function () { return documentation_registry_1.DocumentationRegistry; } });
var method_1 = require("./method/method");
Object.defineProperty(exports, "Method", { enumerable: true, get: function () { return method_1.Method; } });
var methods_collection_1 = require("./method/methods-collection");
Object.defineProperty(exports, "MethodsCollection", { enumerable: true, get: function () { return methods_collection_1.MethodsCollection; } });
var method_type_1 = require("./method/method-type");
Object.defineProperty(exports, "MethodType", { enumerable: true, get: function () { return method_type_1.MethodType; } });
var strategy_type_1 = require("@/strategies/strategy-type");
Object.defineProperty(exports, "StrategyType", { enumerable: true, get: function () { return strategy_type_1.StrategyType; } });
var express_strategy_1 = require("@/strategies/express-strategy");
Object.defineProperty(exports, "express", { enumerable: true, get: function () { return express_strategy_1.express; } });
Object.defineProperty(exports, "ExpressStrategy", { enumerable: true, get: function () { return express_strategy_1.ExpressStrategy; } });
var schema_view_1 = require("@/documentation/views/schema-view");
Object.defineProperty(exports, "SchemaView", { enumerable: true, get: function () { return schema_view_1.SchemaView; } });
var schema_builder_1 = require("@/schema-builder");
Object.defineProperty(exports, "SchemaBuilder", { enumerable: true, get: function () { return schema_builder_1.SchemaBuilder; } });
// Controller decorators
var decorators_1 = require("./decorators");
Object.defineProperty(exports, "Controller", { enumerable: true, get: function () { return decorators_1.Controller; } });
Object.defineProperty(exports, "MethodDecorator", { enumerable: true, get: function () { return decorators_1.Method; } });
Object.defineProperty(exports, "Get", { enumerable: true, get: function () { return decorators_1.Get; } });
Object.defineProperty(exports, "Post", { enumerable: true, get: function () { return decorators_1.Post; } });
Object.defineProperty(exports, "Put", { enumerable: true, get: function () { return decorators_1.Put; } });
Object.defineProperty(exports, "Delete", { enumerable: true, get: function () { return decorators_1.Delete; } });
Object.defineProperty(exports, "Description", { enumerable: true, get: function () { return decorators_1.Description; } });
Object.defineProperty(exports, "Describe", { enumerable: true, get: function () { return decorators_1.Describe; } });
// Re-export Guard decorator separately to avoid naming conflict
var guard_decorator_1 = require("./decorators/guard.decorator");
Object.defineProperty(exports, "GuardDecorator", { enumerable: true, get: function () { return guard_decorator_1.Guard; } });
// Controller utilities
var controller_parser_1 = require("./controller/controller-parser");
Object.defineProperty(exports, "ControllerParser", { enumerable: true, get: function () { return controller_parser_1.ControllerParser; } });
// Schema - primary export for service-to-service communication
var schema_1 = require("@/schema");
Object.defineProperty(exports, "Schema", { enumerable: true, get: function () { return schema_1.Schema; } });
