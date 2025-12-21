// Import reflect-metadata at the entry point of the library
// This ensures it's available for all decorator metadata operations
import "reflect-metadata";

export { Api } from "@/api";
export { RestApi } from "@/rest-api";
export { DocumentationRegistry } from "@/documentation/documentation-registry";
export { ClassType } from "@filipgorny/types";
export { Method } from "./method/method";
export { MethodsCollection } from "./method/methods-collection";
export { MethodType } from "./method/method-type";
export type { MethodOptions } from "./method/method-options";
export type { MethodConfig } from "./method/method-config";
export type { TypesRegistry } from "./method/types-registry";
export { StrategyType } from "@/strategies/strategy-type";
export { express, ExpressStrategy } from "@/strategies/express-strategy";
export type { Strategy } from "@/strategies/strategy";
export { SchemaView } from "@/documentation/views/schema-view";
export { SchemaBuilder } from "@/schema-builder";
export type { Guard } from "@/guard/guard";

// Controller decorators
export {
  Controller,
  Method as MethodDecorator,
  Get,
  Post,
  Put,
  Delete,
  Description,
  Describe,
  Param,
} from "./decorators";

// Re-export Guard decorator separately to avoid naming conflict
export { Guard as GuardDecorator } from "./decorators/guard.decorator";

// Controller utilities
export { ControllerParser } from "./controller/controller-parser";
export type {
  MethodMetadata,
  ControllerMetadata,
} from "./controller/controller-metadata";

// Errors
export { ResourceNotFoundError } from "@/errors/resource-not-found.error";

// Schema - primary export for service-to-service communication
export { Schema } from "@/schema";
export type {
  ServiceInfo,
  Operation,
  OperationType,
  SchemaReference,
  SchemaDefinition,
  JsonSchema,
  PropertySchema,
  ProtocolType,
  HttpMethod,
} from "@/schema";
