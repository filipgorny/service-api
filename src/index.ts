// Import reflect-metadata at the entry point of the library
// This ensures it's available for all decorator metadata operations
import "reflect-metadata";

export { Api } from "@/api";
export { RestApi } from "@/rest-api";
export { DocumentationRegistry } from "@/documentation/documentation-registry";
export { ClassType } from "@filipgorny/types";
export { Method } from "@/method/method";
export { MethodType } from "@/method/method-type";
export type { MethodOptions } from "@/method/method-options";
export type { TypesRegistry } from "@/method/types-registry";
export { StrategyType } from "@/strategies/strategy-type";
export { express, ExpressStrategy } from "@/strategies/express-strategy";
export type { Strategy } from "@/strategies/strategy";
export { SchemaView } from "@/documentation/views/schema-view";
export type {
  ApiManifest,
  ServiceInfo,
  Operation,
  OperationType,
  SchemaReference,
  SchemaDefinition,
  JsonSchema,
  PropertySchema,
} from "@/manifest/api-manifest";
