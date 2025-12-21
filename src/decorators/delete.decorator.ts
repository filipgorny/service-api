import { MethodType } from "@/method/method-type";
import { Method } from "./method.decorator";

/**
 * Decorator for DELETE operations
 * @param path - Optional path for the endpoint (leading slash optional)
 *               Auto-generated from method name if not provided
 *
 * @example
 * // Explicit path (no leading slash needed)
 * @Delete('users/:id')
 * async deleteUser(input: DeleteUserInput): Promise<void> { }
 *
 * @example
 * // With leading slash (also works)
 * @Delete('/users/:id')
 * async deleteUser(input: DeleteUserInput): Promise<void> { }
 *
 * @example
 * // Auto-generates path as 'delete-user' from method name
 * @Delete()
 * async deleteUser(input: DeleteUserInput): Promise<void> { }
 */
export function Delete(path?: string): MethodDecorator {
  return Method(MethodType.DELETE, path);
}
