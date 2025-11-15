// Decorator factory that attaches a description to a handler function
// Usage: api.action(@describe("Create a new user") async (input) => { ... })

export function describe(description: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    // Store the description in metadata on the handler function
    Reflect.defineMetadata(
      "endpoint:description",
      description,
      descriptor.value,
    );
  };
}
