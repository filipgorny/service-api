import { MethodType } from "@/method/method-type";
import { Method } from "./method.decorator";

/**
 * Decorator for PUT/Update operations
 * @param path - Optional path for the endpoint (leading slash optional)
 *               Auto-generated from method name if not provided
 *
 * @example
 * // Explicit path (no leading slash needed)
 * @Put('users/:id')
 * async updateUser(input: UpdateUserInput): Promise<UserOutput> { }
 *
 * @example
 * // With leading slash (also works)
 * @Put('/users/:id')
 * async updateUser(input: UpdateUserInput): Promise<UserOutput> { }
 *
 * @example
 * // Auto-generates path as 'update-user' from method name
 * @Put()
 * async updateUser(input: UpdateUserInput): Promise<UserOutput> { }
 */
export function Put(path?: string): MethodDecorator {
  return Method(MethodType.UPDATE, path);
}
