import "reflect-metadata";
import { DESCRIPTION_METADATA } from "@/controller/controller-metadata";

/**
 * Decorator to add a description to an API method
 * @param description - Human-readable description of the method
 *
 * @example
 * @Get('/users/:id')
 * @Description('Get user by ID')
 * async getUserById(input: GetUserInput): Promise<UserOutput> { }
 */
export function Description(description: string): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    Reflect.defineMetadata(
      DESCRIPTION_METADATA,
      description,
      target,
      propertyKey,
    );
  };
}
