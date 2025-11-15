import { Method } from "@/method/method";
import { MethodType } from "@/method/method-type";
import { DocumentationRegistry } from "@/documentation/documentation-registry";
import { MethodDocumentation } from "@/documentation/method-documentation";
import { Strategy } from "@/strategies/strategy";
import { getVersionFromPackage } from "@/utils/get-version-from-package";
import { getApiNameFromPackage } from "@/utils/get-api-name-from-package";
import { MethodsCollection } from "@/method/methods-collection";
import { MethodOptions } from "@/method/method-options";

// Abstract base class for all API types (REST, GraphQL, gRPC, etc.)
export abstract class Api {
  protected methods = new MethodsCollection();
  protected documentationRegistry: DocumentationRegistry;
  protected version: string;
  protected apiName: string;

  // Abstract property - must be defined by subclasses (e.g., RestApi, GraphQLApi)
  protected abstract defaultMethods: Method[];

  constructor(
    protected strategy: Strategy,
    protected addDefaultMethods = true,
  ) {
    this.version = getVersionFromPackage();
    this.apiName = getApiNameFromPackage();

    this.documentationRegistry = new DocumentationRegistry(
      this.apiName,
      this.version,
    );
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
}
