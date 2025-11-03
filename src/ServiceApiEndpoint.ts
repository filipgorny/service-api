import { EndpointDefinition } from "./types";

// Class for generating API documentation from endpoint definitions
// Constructor takes an array of endpoints
export class ServiceApiEndpoint {
// Generates a documentation object with endpoints and type schemas
  constructor(private endpoints: EndpointDefinition<any>[]) {}
// Map each endpoint to its documentation summary

  getDocumentation(): any {
    return {
// Use output class name or null if no output
      endpoints: this.endpoints.map((ep) => ({
        method: ep.method,
        path: ep.path,
        input: ep.inputClass.name,
        output: ep.outputClass?.name || null,
        description: ep.description,
      })),
      types: this.endpoints.reduce(
        (acc, ep) => {
          acc[ep.inputClass.name] = this.getClassSchema(ep.inputClass);
          if (ep.outputClass) {
            acc[ep.outputClass.name] = this.getClassSchema(ep.outputClass);
          }
          return acc;
        },
        {} as Record<string, any>,
      ),
    };
  }

  private getClassSchema(cls: any): any {
    // Simple schema extraction; in a real implementation, you might use reflection or a library
    return {
      name: cls.name,
      properties: Object.keys(new cls()),
    };
  }
}
