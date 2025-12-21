// Import reflect-metadata to enable metadata reflection for decorators
import "reflect-metadata";

// Re-export all decorators for controller support
export { Controller } from "./decorators/controller.decorator";
export { Method } from "./decorators/method.decorator";
export { Get } from "./decorators/get.decorator";
export { Post } from "./decorators/post.decorator";
export { Put } from "./decorators/put.decorator";
export { Delete } from "./decorators/delete.decorator";
export { Description } from "./decorators/description.decorator";
export { Guard } from "./decorators/guard.decorator";
export { Param } from "./decorators/param.decorator";

// Legacy decorator - kept for backward compatibility
export function Describe(description: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    Reflect.defineMetadata("description", description, target, propertyKey);
    return descriptor;
  };
}
