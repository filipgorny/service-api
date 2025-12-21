import { MethodType } from "@/method/method-type";
import { Method } from "./method.decorator";

/**
 * Decorator for POST/Create operations
 * @param path - Optional path for the endpoint (leading slash optional)
 *               Auto-generated from method name if not provided
 *
 * @example
 * // Explicit path (no leading slash needed)
 * @Post('users')
 * async createUser(input: CreateUserInput): Promise<UserOutput> { }
 *
 * @example
 * // With leading slash (also works)
 * @Post('/users')
 * async createUser(input: CreateUserInput): Promise<UserOutput> { }
 *
 * @example
 * // Auto-generates path as 'create-user' from method name
 * @Post()
 * async createUser(input: CreateUserInput): Promise<UserOutput> { }
 */
export function Post(path?: string): MethodDecorator {
  return Method(MethodType.CREATE, path);
}
