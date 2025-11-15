import { DocumentationView } from "./documentation-view";
import { MethodDocumentation } from "../method-documentation";
import { TypesRegistry } from "@/method/types-registry";
import {
  ApiManifest,
  Operation,
  OperationType,
  SchemaDefinition,
  JsonSchema,
  PropertySchema,
} from "@/manifest/api-manifest";
import { MethodType } from "@/method/method-type";

// Schema view implementation - returns universal API manifest
export class SchemaView extends DocumentationView {
  constructor(
    apiName: string,
    methods: MethodDocumentation[],
    version: string,
    types: TypesRegistry,
    private baseUrl: string = "",
  ) {
    super(apiName, methods, version, types);
  }

  getHTML(): string {
    // Return JSON as HTML for browser viewing
    const manifest = this.getManifest();
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${this.apiName} API Schema</title>
  <style>
    body { font-family: monospace; margin: 20px; background: #f5f5f5; }
    pre { background: white; padding: 20px; border-radius: 4px; overflow: auto; }
  </style>
</head>
<body>
  <h1>${this.apiName} API Schema</h1>
  <pre>${JSON.stringify(manifest, null, 2)}</pre>
</body>
</html>
    `.trim();
  }

  // Main method to get the API manifest
  getManifest(): ApiManifest {
    return {
      service: {
        name: this.apiName,
        version: this.version,
        baseUrl: this.baseUrl,
        description: `${this.apiName} API`,
      },
      operations: this.buildOperations(),
      definitions: this.buildDefinitions(),
    };
  }

  // Get raw schema as JSON string
  getRaw(): string {
    return JSON.stringify(this.getManifest(), null, 2);
  }

  private buildOperations(): Operation[] {
    return this.methods.map((method) => {
      const operationType = this.mapMethodTypeToOperationType(method.type);
      const operationId = this.buildOperationId(method.name, method.type);

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
      };
    });
  }

  private mapMethodTypeToOperationType(methodType: MethodType): OperationType {
    // GET maps to query
    if (methodType === MethodType.GET) {
      return "query";
    }

    // CREATE, UPDATE, DELETE map to mutation
    if (
      methodType === MethodType.CREATE ||
      methodType === MethodType.UPDATE ||
      methodType === MethodType.DELETE
    ) {
      return "mutation";
    }

    // Default to query
    return "query";
  }

  private buildOperationId(name: string, type: MethodType): string {
    // Convert "books" + "GET" → "books.list"
    // Convert "book" + "CREATE" → "book.create"
    // Convert "book/:id" + "GET" → "book.get"

    // Remove URL params
    const cleanName = name.replace(/\/:[^/]+/g, "");

    if (type === MethodType.GET) {
      // If name is plural or contains "list", use .list
      if (cleanName.endsWith("s") || cleanName.includes("list")) {
        return `${cleanName}.list`;
      }
      return `${cleanName}.get`;
    }

    if (type === MethodType.CREATE) {
      return `${cleanName}.create`;
    }

    if (type === MethodType.UPDATE) {
      return `${cleanName}.update`;
    }

    if (type === MethodType.DELETE) {
      return `${cleanName}.delete`;
    }

    return cleanName;
  }

  private buildInputSchema(method: MethodDocumentation): JsonSchema {
    if (!method.input) {
      return { type: "object", properties: {} };
    }

    return {
      type: "object",
      $ref: `#/definitions/${method.input.name}`,
    };
  }

  private buildOutputSchema(method: MethodDocumentation): JsonSchema {
    if (!method.output) {
      return { type: "void" };
    }

    return {
      type: "object",
      $ref: `#/definitions/${method.output.name}`,
    };
  }

  private buildDefinitions(): Record<string, SchemaDefinition> {
    const definitions: Record<string, SchemaDefinition> = {};

    for (const [typeName, typeInfo] of Object.entries(this.types)) {
      definitions[typeName] = {
        type: "object",
        properties: this.buildProperties(typeInfo.properties),
      };
    }

    return definitions;
  }

  private buildProperties(
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
