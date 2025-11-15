import { Api } from "@/api";
import { Method } from "@/method/method";
import { MethodType } from "@/method/method-type";
import { MethodOptions } from "@/method/method-options";
import { OpenApiView } from "@/documentation/views/openapi";
import { SchemaView } from "@/documentation/views/schema-view";

// REST-specific API implementation
export class RestApi extends Api {
  // Default REST endpoints (health, documentation)
  protected defaultMethods: Method[] = [
    // Documentation endpoint
    new Method(
      MethodType.GET,
      "/",
      async () => {
        const documentationView = this.documentationRegistry
          .getDocumentation()
          .getView();

        if (documentationView instanceof OpenApiView) {
          return documentationView.getHTML();
        }
      },
      "Documentation endpoint",
    ),
    // Schema endpoint
    new Method(
      MethodType.GET,
      "schema",
      async () => {
        const documentation = this.documentationRegistry.getDocumentation();
        const schemaView = new SchemaView(
          this.apiName,
          documentation.methods,
          this.version,
          documentation.types,
          "",
        );
        return schemaView.getManifest();
      },
      "Universal API schema manifest",
    ),
    // Health check endpoint
    new Method(
      MethodType.GET,
      "health",
      async () => {
        return {
          status: "healthy",
          version: this.version,
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        };
      },
      "Health check",
    ),
  ];

  // REST-specific convenience methods

  // GET - Read operations, health checks, info endpoints
  get<TInput, TOutput>(
    options: MethodOptions,
    handler: (input?: TInput) => Promise<TOutput>,
  ): this {
    const paramTypes = Reflect.getMetadata("design:paramtypes", handler);
    const returnType = Reflect.getMetadata("design:returntype", handler);

    const inputClass = paramTypes?.[0];
    const outputClass = returnType;

    // Extract name and description from options
    let methodName: string;
    let description: string | undefined;
    if (typeof options === "string") {
      methodName = options;
      description = "Get method";
    } else {
      methodName = options.name;
      description = options.description;
    }

    const method = new Method(
      MethodType.GET,
      methodName,
      handler,
      description,
      inputClass,
      outputClass,
    );

    return this.registerMethod(method);
  }

  // POST/CREATE - Create operations
  create<TInput, TOutput>(
    options: MethodOptions,
    handler: (input?: TInput) => Promise<TOutput>,
  ): this {
    const paramTypes = Reflect.getMetadata("design:paramtypes", handler);
    const returnType = Reflect.getMetadata("design:returntype", handler);

    const inputClass = paramTypes?.[0];
    const outputClass = returnType;

    // Extract name and description from options
    let methodName: string;
    let description: string | undefined;
    if (typeof options === "string") {
      methodName = options;
      description = "Create method";
    } else {
      methodName = options.name;
      description = options.description;
    }

    const method = new Method(
      MethodType.CREATE,
      methodName,
      handler,
      description,
      inputClass,
      outputClass,
    );

    return this.registerMethod(method);
  }

  // PUT/UPDATE - Update operations
  update<TInput, TOutput>(
    options: MethodOptions,
    handler: (input?: TInput) => Promise<TOutput>,
  ): this {
    const paramTypes = Reflect.getMetadata("design:paramtypes", handler);
    const returnType = Reflect.getMetadata("design:returntype", handler);

    const inputClass = paramTypes?.[0];
    const outputClass = returnType;

    // Extract name and description from options
    let methodName: string;
    let description: string | undefined;
    if (typeof options === "string") {
      methodName = options;
      description = "Update method";
    } else {
      methodName = options.name;
      description = options.description;
    }

    const method = new Method(
      MethodType.UPDATE,
      methodName,
      handler,
      description,
      inputClass,
      outputClass,
    );

    return this.registerMethod(method);
  }

  // DELETE - Delete operations
  delete<TInput>(
    options: MethodOptions,
    handler: (input?: TInput) => Promise<void>,
  ): this {
    const paramTypes = Reflect.getMetadata("design:paramtypes", handler);
    const returnType = Reflect.getMetadata("design:returntype", handler);

    const inputClass = paramTypes?.[0];
    const outputClass = returnType;

    // Extract name and description from options
    let methodName: string;
    let description: string | undefined;
    if (typeof options === "string") {
      methodName = options;
      description = "Delete method";
    } else {
      methodName = options.name;
      description = options.description;
    }

    const method = new Method(
      MethodType.DELETE,
      methodName,
      handler,
      description,
      inputClass,
      outputClass,
    );

    return this.registerMethod(method);
  }
}
