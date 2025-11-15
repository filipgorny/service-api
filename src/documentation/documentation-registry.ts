import { MethodDocumentation } from "@/documentation/method-documentation";
import { Documentation } from "@/documentation/documentation";
import { TypesRegistry } from "@/method/types-registry";

// Registry for storing type information and generating API documentation
export class DocumentationRegistry {
  private typeRegistry: Map<string, any> = new Map();
  private methodRegistry: MethodDocumentation[] = [];

  constructor(
    private apiName: string,
    private apiVersion: string,
  ) {}

  // Register input and output types for documentation
  registerTypes(inputType: any, outputType?: any): void {
    if (inputType) {
      this.typeRegistry.set(inputType.name, inputType);
    }

    if (outputType) {
      this.typeRegistry.set(outputType.name, outputType);
    }
  }

  // Register method details for documentation
  registerMethod(method: MethodDocumentation): void {
    this.methodRegistry.push(method);
  }

  // Generates a documentation object with registered types and methods
  getDocumentation(): Documentation {
    const types: TypesRegistry = {};

    this.typeRegistry.forEach((cls, name) => {
      types[name] = this.getClassSchema(cls);
    });

    return new Documentation(types, this.methodRegistry, this.apiName, this.apiVersion);
  }

  private getClassSchema(cls: any): any {
    return {
      name: cls.name,
      properties: Object.keys(new cls()),
    };
  }
}
