// Universal API Manifest - Protocol-agnostic API description format

export interface ApiManifest {
  service: ServiceInfo;
  operations: Operation[];
  definitions: Record<string, SchemaDefinition>;
}

export interface ServiceInfo {
  name: string;
  version: string;
  baseUrl: string;
  description?: string;
}

export type OperationType = "query" | "mutation" | "subscription";

export interface Operation {
  id: string; // e.g., "books.list", "book.create"
  operationType: OperationType;
  input: SchemaReference;
  output: SchemaReference;
  description?: string;
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
