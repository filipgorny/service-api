import "reflect-metadata";
import { MethodType } from "@/method/method-type";
import {
  METHOD_METADATA,
  MethodMetadata,
} from "@/controller/controller-metadata";

/**
 * Base decorator for defining API method endpoints
 * @param type - HTTP method type (GET, CREATE, UPDATE, DELETE)
 * @param path - Optional path for the method (auto-generated from method name if not provided)
 *
 * @example
 * @Method(MethodType.GET, '/users/:id')
 * async getUser(input: GetUserInput): Promise<UserOutput> { }
 */
export function Method(type: MethodType, path?: string): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const metadata: MethodMetadata = {
      type,
      path,
      propertyKey: propertyKey.toString(),
    };

    // Store method metadata
    Reflect.defineMetadata(METHOD_METADATA, metadata, target, propertyKey);

    return descriptor;
  };
}
