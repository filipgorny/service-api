// Import reflect-metadata to enable metadata reflection for decorators
import "reflect-metadata";
// Decorator factory that attaches a description to a method using Reflect metadata

export function Describe(description: string) {
  return function (
    target: any,
    propertyKey: string,
    // Store the description in metadata on the class constructor for the method
    descriptor: PropertyDescriptor,
  ) {
    Reflect.defineMetadata("description", description, target, propertyKey);
  };
}
