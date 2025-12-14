import "reflect-metadata";
import { CONTROLLER_PATH_METADATA } from "@/controller/controller-metadata";
import { deriveControllerPath } from "@/utils/derive-controller-path";

/**
 * Decorator to mark a class as a controller with a base path
 * @param path - Optional base path for all methods in this controller.
 *               Leading slash is optional.
 *               If not provided, derived from class name.
 *
 * @example
 * // Explicit path (leading slash optional)
 * @Controller('users')
 * class UserController { }
 *
 * @example
 * // Auto-derived from class name
 * @Controller()
 * class UserController { }  // Path: '/user'
 *
 * @example
 * // Root controller
 * @Controller('')
 * class RootController { }
 */
export function Controller(path?: string): ClassDecorator {
  return (target: any) => {
    let controllerPath: string;

    if (path === undefined) {
      // Auto-derive path from class name
      controllerPath = deriveControllerPath(target.name);
    } else {
      // Use provided path (will be normalized in parser)
      controllerPath = path;
    }

    // Store controller path in metadata
    Reflect.defineMetadata(CONTROLLER_PATH_METADATA, controllerPath, target);
  };
}
