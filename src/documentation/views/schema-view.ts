import { Schema } from "@/schema";

/**
 * SchemaView - Renders Schema object as YAML/JSON/HTML
 *
 * This view accepts a Schema object and renders it in various formats.
 * It does NOT build the schema - that's done by RestApi/GraphQLApi/etc.
 */
export class SchemaView {
  private schema: Schema;

  constructor(schema: Schema) {
    this.schema = schema;
  }

  /**
   * Get HTML representation of schema
   */
  getHTML(): string {
    const yaml = this.toYAML();
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${this.schema.service.name} API Schema</title>
  <style>
    body { font-family: monospace; margin: 20px; background: #f5f5f5; }
    pre { background: white; padding: 20px; border-radius: 4px; overflow: auto; line-height: 1.5; }
    h1 { color: #333; }
    .protocol { color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <h1>${this.schema.service.name} API Schema</h1>
  <p class="protocol">Protocol: ${this.schema.service.protocol} | Version: ${this.schema.service.version}</p>
  <pre>${yaml}</pre>
</body>
</html>
    `.trim();
  }

  /**
   * Get Schema object
   */
  getSchema(): Schema {
    return this.schema;
  }

  /**
   * Get raw schema as JSON string
   */
  getRaw(): string {
    return JSON.stringify(this.schema.toJSON(), null, 2);
  }

  /**
   * Convert schema to YAML format
   */
  toYAML(): string {
    const schema = this.schema.toJSON();
    let yaml = "";

    // Service info
    yaml += "service:\n";
    yaml += `  name: ${schema.service.name}\n`;
    yaml += `  version: ${schema.service.version}\n`;
    yaml += `  protocol: ${schema.service.protocol}\n`;
    yaml += `  baseUrl: ${schema.service.baseUrl}\n`;
    if (schema.service.description) {
      yaml += `  description: ${schema.service.description}\n`;
    }
    yaml += "\n";

    // Operations
    yaml += "operations:\n";
    for (const op of schema.operations) {
      yaml += `  - id: ${op.id}\n`;
      yaml += `    operationType: ${op.operationType}\n`;
      if (op.description) {
        yaml += `    description: "${op.description}"\n`;
      }

      // REST-specific details
      if (op.rest) {
        yaml += `    rest:\n`;
        yaml += `      method: ${op.rest.method}\n`;
        yaml += `      path: ${op.rest.path}\n`;
      }

      // GraphQL-specific details
      if (op.graphql) {
        yaml += `    graphql:\n`;
        yaml += `      query: "${op.graphql.query}"\n`;
      }

      // Input schema
      yaml += `    input:\n`;
      if (op.input.schema.$ref) {
        yaml += `      $ref: "${op.input.schema.$ref}"\n`;
      } else {
        yaml += `      type: ${op.input.schema.type}\n`;
      }

      // Output schema
      yaml += `    output:\n`;
      if (op.output.schema.$ref) {
        yaml += `      $ref: "${op.output.schema.$ref}"\n`;
      } else {
        yaml += `      type: ${op.output.schema.type}\n`;
      }
    }
    yaml += "\n";

    // Definitions
    if (Object.keys(schema.definitions).length > 0) {
      yaml += "definitions:\n";
      for (const [name, def] of Object.entries(schema.definitions)) {
        yaml += `  ${name}:\n`;
        yaml += `    type: ${def.type}\n`;
        if (def.properties) {
          yaml += `    properties:\n`;
          for (const [propName, propSchema] of Object.entries(def.properties)) {
            yaml += `      ${propName}:\n`;
            yaml += `        type: ${propSchema.type || "string"}\n`;
            if (propSchema.required) {
              yaml += `        required: ${propSchema.required}\n`;
            }
          }
        }
      }
    }

    return yaml;
  }
}
