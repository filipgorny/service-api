import { Method } from "@/method/method";
import { DocumentationRegistry } from "@/documentation/documentation-registry";
import { MethodDocumentation } from "@/documentation/method-documentation";
import { Strategy } from "@/strategies/strategy";
import { getVersionFromPackage } from "@/utils/get-version-from-package";
import { getApiNameFromPackage } from "@/utils/get-api-name-from-package";
import { MethodsCollection } from "@/method/methods-collection";
import { Logger } from "@filipgorny/logger";
import { Guard } from "@/guard/guard";
import { ControllerParser } from "@/controller/controller-parser";

// Abstract base class for all API types (REST, GraphQL, gRPC, etc.)
export abstract class Api {
  protected methods = new MethodsCollection();
  protected documentationRegistry: DocumentationRegistry;
  protected version: string;
  protected apiName: string;
  protected logger: Logger;

  // Guard registry for controller decorators
  private guardRegistry = new Map<string, Guard>();
  private defaultGuard?: Guard;

  // Abstract property - must be defined by subclasses (e.g., RestApi, GraphQLApi)
  protected abstract defaultMethods: Method[];

  constructor(
    protected strategy: Strategy,
    protected addDefaultMethods = true,
  ) {
    this.version = getVersionFromPackage();
    this.apiName = getApiNameFromPackage();
    this.logger = new Logger(undefined, { service: this.apiName });

    this.documentationRegistry = new DocumentationRegistry(
      this.apiName,
      this.version,
    );

    this.setupGracefulShutdown();
  }

  private setupGracefulShutdown(): void {
    process.on("SIGTERM", async () => {
      this.logger.info("SIGTERM received, shutting down gracefully");
      await this.shutdown();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      this.logger.info("SIGINT received, shutting down gracefully");
      await this.shutdown();
      process.exit(0);
    });
  }

  run(): void {
    if (this.addDefaultMethods) {
      // Add default methods to the collection
      for (const method of this.defaultMethods) {
        this.methods.add(method);
        this.documentationRegistry.registerMethod(
          MethodDocumentation.fromMethod(method),
        );
      }
    }

    this.strategy.configure(this.methods, this.version);
    this.strategy.onApiRun();
  }

  // Core method for registering any type of method
  protected registerMethod(method: Method): this {
    this.documentationRegistry.registerTypes(
      method.inputClass,
      method.outputClass,
    );
    this.methods.add(method);
    this.documentationRegistry.registerMethod(
      MethodDocumentation.fromMethod(method),
    );

    return this;
  }

  getDocumentation(): any {
    return {
      version: this.version,
      ...this.documentationRegistry.getDocumentation(),
    };
  }

  getMethods(): MethodsCollection {
    return this.methods;
  }

  getVersion(): string {
    return this.version;
  }

  getApiName(): string {
    return this.apiName;
  }

  async shutdown(): Promise<void> {
    if (this.strategy.close) {
      await this.strategy.close();
    }
  }

  /**
   * Register a named guard that can be used with @Guard('name') decorator
   * @param name - Name of the guard
   * @param guard - Guard instance
   * @returns this for method chaining
   *
   * @example
   * api.registerGuard('jwt', jwtGuard)
   *    .registerGuard('admin', adminGuard);
   */
  registerGuard(name: string, guard: Guard): this {
    this.guardRegistry.set(name, guard);
    this.logger.info(`Registered guard: ${name}`);
    return this;
  }

  /**
   * Register a default guard that will be used when @Guard() has no argument
   * @param guard - Guard instance
   * @returns this for method chaining
   *
   * @example
   * api.registerDefaultGuard(jwtGuard);
   */
  registerDefaultGuard(guard: Guard): this {
    this.defaultGuard = guard;
    this.logger.info("Registered default guard");
    return this;
  }

  /**
   * Register a controller class with decorated methods
   * @param controllerClass - Controller class decorated with @Controller
   * @returns this for method chaining
   * @throws Error if controller doesn't have @Controller decorator or guard is not found
   *
   * @example
   * @Controller('/users')
   * class UserController {
   *   @Get('/:id')
   *   @Guard('jwt')
   *   async getUser(input: GetUserInput): Promise<UserOutput> { }
   * }
   *
   * api.registerController(UserController);
   */
  registerController(controllerClass: any): this {
    this.logger.info(`Registering controller: ${controllerClass.name}`);

    // Parse controller and extract method configurations
    const methodConfigs = ControllerParser.parse(
      controllerClass,
      this.guardRegistry,
      this.defaultGuard,
    );

    // Register each method
    for (const config of methodConfigs) {
      const method = new Method(config);
      this.registerMethod(method);
      this.logger.info(
        `  Registered ${config.type.toUpperCase()} ${config.name}${config.guard ? " (protected)" : ""}`,
      );
    }

    this.logger.info(
      `✓ Controller ${controllerClass.name} registered with ${methodConfigs.length} method(s)`,
    );

    return this;
  }
}
