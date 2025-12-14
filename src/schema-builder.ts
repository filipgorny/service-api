import {
  Schema,
  ServiceInfo,
  Operation,
  OperationType,
  SchemaDefinition,
  JsonSchema,
  PropertySchema,
  HttpMethod,
} from "@/schema";
import { MethodDocumentation } from "@/documentation/method-documentation";
import { TypesRegistry } from "@/method/types-registry";
import { MethodType } from "@/method/method-type";

/**
 * SchemaBuilder - Builds Schema object from API metadata
 */
export class SchemaBuilder {
  /**
   * Build Schema from REST API metadata
   */
  static buildRestSchema(
    apiName: string,
    version: string,
    baseUrl: string,
    methods: MethodDocumentation[],
    types: TypesRegistry,
    description?: string,
  ): Schema {
    const service: ServiceInfo = {
      name: apiName,
      version,
      baseUrl,
      protocol: "REST",
      description: description || `${apiName} REST API`,
    };

    const operations = methods.map((method) => this.buildRestOperation(method));

    const definitions = this.buildDefinitions(types);

    return new Schema(service, operations, definitions);
  }

  /**
   * Build single REST operation from method documentation
   */
  private static buildRestOperation(method: MethodDocumentation): Operation {
    const operationType = this.mapMethodTypeToOperationType(method.type);
    const operationId = this.buildOperationId(method.name, method.type);
    const httpMethod = this.mapMethodTypeToHttpMethod(method.type);

    return {
      id: operationId,
      operationType,
      description: method.description,
      input: {
        schema: this.buildInputSchema(method),
      },
      output: {
        schema: this.buildOutputSchema(method),
      },
      rest: {
        method: httpMethod,
        path: `/${method.name}`,
      },
    };
  }

  /**
   * Map MethodType to OperationType
   */
  private static mapMethodTypeToOperationType(
    methodType: MethodType,
  ): OperationType {
    if (methodType === MethodType.GET) {
      return "query";
    }

    if (
      methodType === MethodType.CREATE ||
      methodType === MethodType.UPDATE ||
      methodType === MethodType.DELETE
    ) {
      return "mutation";
    }

    return "query";
  }

  /**
   * Map MethodType to HTTP Method
   */
  private static mapMethodTypeToHttpMethod(methodType: MethodType): HttpMethod {
    switch (methodType) {
      case MethodType.GET:
        return "GET";
      case MethodType.CREATE:
        return "POST";
      case MethodType.UPDATE:
        return "PUT";
      case MethodType.DELETE:
        return "DELETE";
      default:
        return "GET";
    }
  }

  /**
   * Build operation ID from method name and type
   * Format: methodName.methodType (e.g., "detect-tasks.create", "users.get")
   */
  private static buildOperationId(name: string, type: MethodType): string {
    // Remove URL params and leading slash
    const cleanName = name.replace(/\/:[^/]+/g, "").replace(/^\//, "");

    // Map MethodType to operation suffix
    const suffix = type.toLowerCase(); // GET->get, CREATE->create, etc.

    return `${cleanName}.${suffix}`;
  }

  /**
   * Build input schema from method
   */
  private static buildInputSchema(method: MethodDocumentation): JsonSchema {
    if (!method.input) {
      return { type: "object", properties: {} };
    }

    return {
      type: "object",
      $ref: `#/definitions/${method.input.name}`,
    };
  }

  /**
   * Build output schema from method
   */
  private static buildOutputSchema(method: MethodDocumentation): JsonSchema {
    if (!method.output) {
      return { type: "void" };
    }

    return {
      type: "object",
      $ref: `#/definitions/${method.output.name}`,
    };
  }

  /**
   * Build type definitions
   */
  private static buildDefinitions(
    types: TypesRegistry,
  ): Record<string, SchemaDefinition> {
    const definitions: Record<string, SchemaDefinition> = {};

    for (const [typeName, typeInfo] of Object.entries(types)) {
      definitions[typeName] = {
        type: "object",
        properties: this.buildProperties(typeInfo.properties),
      };
    }

    return definitions;
  }

  /**
   * Build properties schema
   */
  private static buildProperties(
    properties: string[],
  ): Record<string, PropertySchema> {
    const result: Record<string, PropertySchema> = {};

    for (const prop of properties) {
      // Simplified: assume string type for all properties
      // In a real implementation, you'd extract actual types from metadata
      result[prop] = {
        type: "string",
      };
    }

    return result;
  }
}
