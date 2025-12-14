import { MethodType } from "@/method/method-type";
import { Method } from "./method.decorator";

/**
 * Decorator for GET/Read operations
 * @param path - Optional path for the endpoint (leading slash optional)
 *               Auto-generated from method name if not provided
 *
 * @example
 * // Explicit path (no leading slash needed)
 * @Get('users/:id')
 * async getUserById(input: GetUserInput): Promise<UserOutput> { }
 *
 * @example
 * // With leading slash (also works)
 * @Get('/users/:id')
 * async getUserById(input: GetUserInput): Promise<UserOutput> { }
 *
 * @example
 * // Auto-generates path as 'get-user-by-id' from method name
 * @Get()
 * async getUserById(input: GetUserInput): Promise<UserOutput> { }
 */
export function Get(path?: string): MethodDecorator {
  return Method(MethodType.GET, path);
}
