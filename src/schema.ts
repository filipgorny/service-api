// Schema - Pure data structure for service-to-service communication
// This is the transferable schema format, independent of documentation

/**
 * Protocol type - defines how the service communicates
 */
export type ProtocolType = "REST" | "GraphQL" | "gRPC" | "WebSocket";

/**
 * HTTP Method for REST APIs
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Operation type - semantic meaning of the operation
 */
export type OperationType = "query" | "mutation" | "subscription";

/**
 * Service information
 */
export interface ServiceInfo {
  name: string;
  version: string;
  baseUrl: string;
  protocol: ProtocolType;
  description?: string;
}

/**
 * Operation - represents a single API operation
 */
export interface Operation {
  id: string; // e.g., "books.list", "book.create"
  operationType: OperationType;
  input: SchemaReference;
  output: SchemaReference;
  description?: string;

  // Protocol-specific details
  rest?: {
    method: HttpMethod;
    path: string; // e.g., "/books", "/book/:id"
  };
  graphql?: {
    query: string;
  };
  grpc?: {
    service: string;
    method: string;
  };
}

export interface SchemaReference {
  schema: JsonSchema;
}

export interface JsonSchema {
  type: "object" | "array" | "string" | "number" | "boolean" | "void";
  properties?: Record<string, PropertySchema>;
  items?: PropertySchema;
  required?: string[];
  $ref?: string; // Reference to definitions, e.g., "#/definitions/Book"
}

export interface PropertySchema {
  type?: "object" | "array" | "string" | "number" | "boolean";
  required?: boolean;
  items?: PropertySchema;
  properties?: Record<string, PropertySchema>;
  $ref?: string;
}

export interface SchemaDefinition {
  type: "object" | "array" | "string" | "number" | "boolean";
  properties?: Record<string, PropertySchema>;
  items?: PropertySchema;
  required?: string[];
}

/**
 * Schema class - main class for describing API
 */
export class Schema {
  public readonly service: ServiceInfo;
  public readonly operations: Operation[];
  public readonly definitions: Record<string, SchemaDefinition>;

  constructor(
    service: ServiceInfo,
    operations: Operation[],
    definitions: Record<string, SchemaDefinition> = {},
  ) {
    this.service = service;
    this.operations = operations;
    this.definitions = definitions;
  }

  /**
   * Convert to plain JSON object
   */
  toJSON(): {
    service: ServiceInfo;
    operations: Operation[];
    definitions: Record<string, SchemaDefinition>;
  } {
    return {
      service: this.service,
      operations: this.operations,
      definitions: this.definitions,
    };
  }

  /**
   * Create Schema from plain JSON object
   */
  static fromJSON(json: {
    service: ServiceInfo;
    operations: Operation[];
    definitions: Record<string, SchemaDefinition>;
  }): Schema {
    return new Schema(json.service, json.operations, json.definitions);
  }

  /**
   * Get operations by type
   */
  getOperationsByType(type: OperationType): Operation[] {
    return this.operations.filter((op) => op.operationType === type);
  }

  /**
   * Get operation by ID
   */
  getOperation(id: string): Operation | undefined {
    return this.operations.find((op) => op.id === id);
  }

  /**
   * Get definition by name
   */
  getDefinition(name: string): SchemaDefinition | undefined {
    return this.definitions[name];
  }
}
