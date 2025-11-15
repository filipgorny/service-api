import { DocumentationView } from "./documentation-view";
import { MethodDocumentation } from "../method-documentation";
import { TypesRegistry } from "@/method/types-registry";

// OpenAPI view implementation
export class OpenApiView extends DocumentationView {
  constructor(
    apiName: string,
    methods: MethodDocumentation[],
    version: string,
    types: TypesRegistry,
  ) {
    super(apiName, methods, version, types);
  }

  getHTML(): string {
    // Build OpenAPI spec from Documentation
    const spec = this.buildOpenApiSpec();

    // Generate HTML with embedded Swagger UI
    return `
<!DOCTYPE html>
<html>
<head>
  <title>${this.apiName} API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.30.2/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.30.2/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.30.2/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        spec: ${JSON.stringify(spec)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
    `.trim();
  }

  private buildOpenApiSpec(): any {
    const paths: Record<string, any> = {};
    const schemas: Record<string, any> = {};

    // Build schemas from types
    for (const [name, typeInfo] of Object.entries(this.types)) {
      schemas[name] = {
        type: "object",
        properties: typeInfo.properties.reduce((acc: any, prop: string) => {
          acc[prop] = { type: "string" }; // Simplified, assume string
          return acc;
        }, {}),
      };
    }

    // Build paths from methods
    for (const method of this.methods) {
      const path = "/" + method.name;
      if (!paths[path]) {
        paths[path] = {};
      }

      const httpMethod = method.type.toLowerCase();
      paths[path][httpMethod] = {
        summary: method.description || "",
        responses: {
          200: {
            description: "Success",
            content: method.output
              ? {
                  "application/json": {
                    schema: {
                      $ref: `#/components/schemas/${method.output.name}`,
                    },
                  },
                }
              : undefined,
          },
        },
      };

      if (method.input) {
        paths[path][httpMethod].requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: `#/components/schemas/${method.input.name}` },
            },
          },
        };
      }
    }

    return {
      openapi: "3.0.0",
      info: {
        title: this.apiName,
        version: this.version,
      },
      paths,
      components: {
        schemas,
      },
    };
  }
}
