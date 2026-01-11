import expressLib, { Application } from "express";
import cors from "cors";
import path from "path";
import { plainToInstance } from "class-transformer";
import { MethodType } from "@/method/method-type";
import { StrategyType } from "@/strategies/strategy-type";
import { Strategy } from "@/strategies/strategy";
import { MethodsCollection } from "@/method/methods-collection";
import { createLogger, Logger, LogLevel } from "@filipgorny/logger";
import { ResourceNotFoundError } from "@/errors/resource-not-found.error";
import { Method } from "@/method/method";

// Optional auth imports - will be undefined if @filipgorny/auth is not installed
let createRequestContextProxy: any;
let isAuthRequired: any;
let SessionManager: any;
let AccessDeniedError: any;

try {
  const auth = require("@filipgorny/auth");
  createRequestContextProxy = auth.createRequestContextProxy;
  isAuthRequired = auth.isAuthRequired;
  SessionManager = auth.SessionManager;
  AccessDeniedError = auth.AccessDeniedError;
} catch (e) {
  // @filipgorny/auth not installed - authentication features disabled
}

export interface ExpressStrategyOptions {
  enableSwagger?: boolean;
  apiName?: string;
}

export class ExpressStrategy implements Strategy {
  type = StrategyType.REST;

  private app: Application;
  private server: any;
  private logger: Logger;
  private sessionManager?: any; // SessionManager from @filipgorny/auth (optional)
  private registeredMethods: Method[] = [];
  private apiVersion: string = "1.0.0";
  private options: ExpressStrategyOptions;

  constructor(
    private port: number,
    logLevel: LogLevel = LogLevel.INFO,
    options: ExpressStrategyOptions = {},
  ) {
    this.app = expressLib();
    this.logger = createLogger("ExpressStrategy", logLevel);
    this.options = {
      enableSwagger: true,
      apiName: "API",
      ...options,
    };
  }

  configure(methods: MethodsCollection, version: string): void {
    this.apiVersion = version;
    this.registeredMethods = methods.getAll();

    // Built-in middleware
    this.app.use(cors()); // Enable CORS for all routes by default
    this.app.use(expressLib.json());

    // Setup Swagger UI if enabled
    if (this.options.enableSwagger) {
      this.setupSwaggerUI();
    }

    // Register each method as an Express route with metadata-driven validation
    for (const method of methods.getAll()) {
      const httpMethod = this.translateMethodType(method.type);
      const routeHandler = async (
        req: expressLib.Request,
        res: expressLib.Response,
      ) => {
        // Use metadata-extracted inputClass for transformation and validation
        let inputInstance: any;
        // Merge params, query, and body - params take precedence
        // Convert numeric string params to numbers
        const params = Object.entries(req.params).reduce(
          (acc, [key, value]) => {
            const numValue = Number(value);
            acc[key] = !isNaN(numValue) && value !== "" ? numValue : value;
            return acc;
          },
          {} as Record<string, any>,
        );

        const inputData = {
          ...(httpMethod === "GET" ? req.query : req.body),
          ...params,
        };

        // Transform input data to class instance if needed
        let transformedData: any;
        if (method.inputClass) {
          transformedData =
            plainToInstance(method.inputClass, inputData) || inputData;
        } else {
          transformedData = inputData;
        }

        // Wrap in RequestContext if auth package is available
        if (createRequestContextProxy) {
          inputInstance = createRequestContextProxy(transformedData, req);
        } else {
          inputInstance = transformedData;
        }

        // Execute guard if present
        if ((method as any).guard) {
          try {
            const canActivate = await (method as any).guard.canActivate(
              inputInstance.getRequest ? inputInstance.getRequest() : req,
            );

            if (!canActivate) {
              return res.status(403).json({
                error: "Forbidden",
                message: "Access denied",
              });
            }
          } catch (guardError: any) {
            // Check if it's an AccessDeniedError
            if (AccessDeniedError && guardError instanceof AccessDeniedError) {
              return res.status(403).json({
                error: "Forbidden",
                message: guardError.message,
              });
            }

            // Other guard errors
            this.logger.error("Guard execution error:", guardError);
            return res.status(500).json({
              error: "Internal Server Error",
              message: "Guard execution failed",
            });
          }
        }

        // Check if authentication is required for this method
        if (
          isAuthRequired &&
          method.inputClass &&
          isAuthRequired(method.inputClass)
        ) {
          // Extract token from Authorization header
          const authHeader = req.headers.authorization;
          let token: string | undefined;

          if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
          }

          if (!token) {
            return res.status(401).json({
              error: "Unauthorized",
              message: "Missing authentication token",
            });
          }

          // Verify token using SessionManager if available
          if (this.sessionManager) {
            try {
              const session = await this.sessionManager.verifyToken(token);

              if (!session) {
                return res.status(401).json({
                  error: "Unauthorized",
                  message: "Invalid or expired token",
                });
              }

              // Attach session and user to context if using RequestContext
              if (inputInstance.setSession && inputInstance.setUser) {
                inputInstance.setSession(session);
                // Load user from session if needed
                if (session.user) {
                  inputInstance.setUser(session.user);
                }
              }
            } catch (authError: any) {
              this.logger.error("Authentication error:", authError);
              return res.status(401).json({
                error: "Unauthorized",
                message: "Authentication failed",
              });
            }
          } else {
            // SessionManager not configured but auth is required
            this.logger.warn(
              "Authentication required but SessionManager not configured",
            );
            return res.status(500).json({
              error: "Internal Server Error",
              message: "Authentication not configured",
            });
          }
        }

        // Execute handler with validated input - wrapped in try-catch
        try {
          const context = {
            params: req.params,
            query: req.query,
            body: req.body,
          };
          const result = await method.handler(inputInstance, context);

          if (typeof result === "string") {
            res.type("text/html").send(result);
          } else {
            res.json(result);
          }

          return;
        } catch (handlerError: any) {
          // Check if error is ResourceNotFoundError - return 404
          if (handlerError instanceof ResourceNotFoundError) {
            this.logger.warn(
              `[Resource Not Found] ${httpMethod} ${method.name}:`,
              handlerError,
            );

            return res.status(404).json({
              error: "Resource not found",
              message:
                handlerError.message || "The requested resource was not found",
            });
          }

          // Check if it's an AccessDeniedError thrown from within the handler
          if (AccessDeniedError && handlerError instanceof AccessDeniedError) {
            return res.status(403).json({
              error: "Forbidden",
              message: handlerError.message,
            });
          }

          // Handler threw an error - return 500 Internal Service Error
          this.logger.error(
            `[Service Error] ${httpMethod} ${method.name}:`,
            handlerError,
          );

          return res.status(500).json({
            error: "Internal service error",
            message: handlerError.message || "An unexpected error occurred",
          });
        }
      };

      // Register the route
      const path = this.generatePath(method.name);
      switch (httpMethod) {
        case "GET":
          this.app.get(path, routeHandler);
          break;
        case "POST":
          this.app.post(path, routeHandler);
          break;
        case "PUT":
          this.app.put(path, routeHandler);
          break;
        case "DELETE":
          this.app.delete(path, routeHandler);
          break;
      }
    }
  }

  /**
   * Set the SessionManager for authentication
   * @param sessionManager - SessionManager instance from @filipgorny/auth
   */
  setSessionManager(sessionManager: any): void {
    this.sessionManager = sessionManager;
  }

  onApiRun(): void {
    if (!this.app) {
      throw new Error("Strategy not initialized");
    }

    this.server = this.app.listen(this.port, () => {
      this.logger.info(`✅ Server ready at http://localhost:${this.port}`);
    });
  }

  // Translate generic MethodType to HTTP method
  private translateMethodType(type: MethodType): string {
    switch (type) {
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

  // Generate URL path from method name
  private generatePath(name: string): string {
    // If name already starts with /, use as is
    if (name.startsWith("/")) {
      return name;
    }
    // Otherwise, prepend / to create a valid path
    return `/${name}`;
  }

  /**
   * Get Express app instance (for testing purposes)
   */
  getApp(): Application {
    return this.app;
  }

  /**
   * Get HTTP server instance (for testing purposes)
   */
  getServer(): any {
    return this.server;
  }

  /**
   * Close the HTTP server and cleanup resources
   */
  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((error?: Error) => {
          if (error) {
            this.logger.error("Error closing server:", error);
            reject(error);
          } else {
            this.logger.info("Server closed successfully");
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Setup Swagger UI endpoints
   */
  private setupSwaggerUI(): void {
    // Build OpenAPI spec from registered methods
    const openApiSpec = this.buildOpenApiSpec();

    // Serve Swagger UI static files
    const swaggerUiPath = path.dirname(require.resolve("swagger-ui-dist/package.json"));
    this.app.use("/swagger-ui", expressLib.static(swaggerUiPath));

    // Serve OpenAPI spec as JSON
    this.app.get("/openapi.json", (_req, res) => {
      res.json(openApiSpec);
    });

    // Serve Swagger UI HTML at root and /docs
    const swaggerHtml = this.generateSwaggerHTML();
    this.app.get("/", (_req, res) => {
      res.type("text/html").send(swaggerHtml);
    });
    this.app.get("/docs", (_req, res) => {
      res.type("text/html").send(swaggerHtml);
    });

    this.logger.info("Swagger UI enabled at / and /docs");
  }

  /**
   * Generate Swagger UI HTML page
   */
  private generateSwaggerHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.options.apiName} - API Documentation</title>
  <link rel="stylesheet" type="text/css" href="/swagger-ui/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="/swagger-ui/swagger-ui-bundle.js"></script>
  <script src="/swagger-ui/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      SwaggerUIBundle({
        url: "/openapi.json",
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

  /**
   * Build OpenAPI 3.0 specification from registered methods
   */
  private buildOpenApiSpec(): object {
    const paths: Record<string, any> = {};

    for (const method of this.registeredMethods) {
      const routePath = this.generatePath(method.name);
      const httpMethod = this.translateMethodType(method.type).toLowerCase();

      if (!paths[routePath]) {
        paths[routePath] = {};
      }

      const operation: any = {
        summary: method.description || method.name,
        operationId: method.name.replace(/[^a-zA-Z0-9]/g, "_"),
        tags: [this.extractTag(routePath)],
        responses: {
          "200": {
            description: "Successful response",
            content: {
              "application/json": {
                schema: { type: "object" },
              },
            },
          },
          "400": {
            description: "Bad request",
          },
          "500": {
            description: "Internal server error",
          },
        },
      };

      // Add request body for POST/PUT methods
      if (httpMethod === "post" || httpMethod === "put") {
        operation.requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object" },
            },
          },
        };
      }

      // Extract path parameters
      const pathParams = routePath.match(/:([^/]+)/g);
      if (pathParams) {
        operation.parameters = pathParams.map((param) => ({
          name: param.substring(1),
          in: "path",
          required: true,
          schema: { type: "string" },
        }));
      }

      paths[routePath][httpMethod] = operation;
    }

    return {
      openapi: "3.0.0",
      info: {
        title: this.options.apiName,
        version: this.apiVersion,
        description: `API Documentation for ${this.options.apiName}`,
      },
      servers: [
        {
          url: `http://localhost:${this.port}`,
          description: "Development server",
        },
      ],
      paths,
    };
  }

  /**
   * Extract tag from route path (first segment)
   */
  private extractTag(path: string): string {
    const segments = path.split("/").filter(Boolean);
    if (segments.length > 0) {
      return segments[0].replace(/^:/, "");
    }
    return "default";
  }
}

// Factory function for creating Express strategy
export function express(port: number, options?: ExpressStrategyOptions): ExpressStrategy {
  return new ExpressStrategy(port, LogLevel.INFO, options);
}
