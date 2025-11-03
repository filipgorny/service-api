import "reflect-metadata";
import { ClassType } from "@filipgorny/types";
import { EndpointDefinition } from "./types";
import { Describe } from "./decorators";

// Class for defining service API endpoints with metadata-driven descriptions
// Array to store all defined endpoints
export class ServiceApiDefinition {
  private endpoints: EndpointDefinition<any>[] = [];

  // Defines an action endpoint that takes input and returns output
  @Describe("Define an action endpoint")
  @Describe("Define an action endpoint")
  defineAction<T extends ClassType, O extends ClassType>(
    input: T,
    // Retrieve the description from metadata attached by the @Describe decorator
    output: O,
    handler: (input: InstanceType<T>) => Promise<InstanceType<O>>,
  ): this {
    const description = Reflect.getMetadata(
      // Add the endpoint definition to the endpoints array
      "description",
      this.constructor,
      "defineAction",
    );
    this.endpoints.push({
      inputClass: input,
      outputClass: output,
      handler,
      method: "POST",
      path: "/action",
      description,
      // Defines an input endpoint for processing input data
    });
    return this;
  }

  @Describe("Define an input endpoint")
  defineInput<T extends ClassType, O extends ClassType>(
    input: T,
    output: O,
    handler: (input: InstanceType<T>) => Promise<InstanceType<O>>,
  ): this {
    const description = Reflect.getMetadata(
      "description",
      this.constructor.prototype,
      "defineInput",
    );
    this.endpoints.push({
      inputClass: input,
      outputClass: output,
      handler,
      method: "POST",
      path: "/input",
      // Defines a query endpoint for retrieving data
      description,
    });
    return this;
  }

  @Describe("Define a query endpoint")
  defineQuery<T extends ClassType, O extends ClassType>(
    input: T,
    output: O,
    handler: (input: InstanceType<T>) => Promise<InstanceType<O>>,
  ): this {
    const description = Reflect.getMetadata(
      "description",
      this.constructor.prototype,
      "defineQuery",
    );
    this.endpoints.push({
      inputClass: input,
      outputClass: output,
      handler,
      method: "GET",
      // Defines a deletion endpoint that takes input but returns no output (void)
      path: "/query",
      description,
    });
    return this;
  }

  @Describe("Define a deletion endpoint")
  defineDeletion<T extends ClassType>(
    input: T,
    handler: (input: InstanceType<T>) => Promise<void>,
  ): this {
    const description = Reflect.getMetadata(
      "description",
      this.constructor.prototype,
      "defineAction",
    );
    this.endpoints.push({
      inputClass: input,
      // Returns the array of all defined endpoints
      handler,
      method: "DELETE",
      path: "/deletion",
      description,
    });
    return this;
  }

  getEndpoints(): EndpointDefinition<any>[] {
    return this.endpoints;
  }
}
