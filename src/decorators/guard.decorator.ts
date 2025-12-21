import "reflect-metadata";
import { GUARD_METADATA } from "@/controller/controller-metadata";

/**
 * Decorator to protect an API method with a guard
 * @param guardName - Optional name of the guard from registry. If not provided, uses default guard
 *
 * @example
 * // Use named guard
 * @Get('/users/:id')
 * @Guard('jwt')
 * async getUserById(input: GetUserInput): Promise<UserOutput> { }
 *
 * @example
 * // Use default guard
 * @Get('/profile')
 * @Guard()
 * async getProfile(input: GetProfileInput): Promise<UserOutput> { }
 */
export function Guard(guardName?: string): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    // Store guard name (or empty string for default guard)
    const guardValue = guardName !== undefined ? guardName : "";
    Reflect.defineMetadata(GUARD_METADATA, guardValue, target, propertyKey);
  };
}
