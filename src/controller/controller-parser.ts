import "reflect-metadata";
import { MethodConfig } from "@/method/method-config";
import { Guard } from "@/guard/guard";
import { camelToDashCase } from "@/utils/camel-to-dash-case";
import { normalizePath } from "@/utils/normalize-path";
import {
  CONTROLLER_PATH_METADATA,
  METHOD_METADATA,
  DESCRIPTION_METADATA,
  GUARD_METADATA,
  PARAM_METADATA,
  MethodMetadata,
  ParamMetadata,
} from "./controller-metadata";

/**
 * Parser for extracting method configurations from controller classes
 */
export class ControllerParser {
  /**
   * Parse a controller class or instance and extract all method configurations
   * @param controllerClassOrInstance - Controller class or instance decorated with @Controller
   * @param guardRegistry - Map of registered guards by name
   * @param defaultGuard - Optional default guard to use when @Guard() has no argument
   * @returns Array of MethodConfig objects for each decorated method
   * @throws Error if controller doesn't have @Controller decorator or guard is not found
   */
  static parse(
    controllerClassOrInstance: any,
    guardRegistry: Map<string, Guard>,
    defaultGuard?: Guard,
  ): MethodConfig[] {
    // Determine if it's a class or instance
    const isClass = typeof controllerClassOrInstance === "function";
    const controllerClass = isClass
      ? controllerClassOrInstance
      : controllerClassOrInstance.constructor;

    // 1. Validate that the class has @Controller decorator
    const controllerPath = Reflect.getMetadata(
      CONTROLLER_PATH_METADATA,
      controllerClass,
    );

    if (!controllerPath) {
      throw new Error(
        `Class "${controllerClass.name}" must have @Controller decorator. ` +
          `Usage: @Controller('/path')`,
      );
    }

    // 2. Get or create controller instance
    const instance = isClass
      ? new controllerClass()
      : controllerClassOrInstance;
    const prototype = Object.getPrototypeOf(instance);
    const methodConfigs: MethodConfig[] = [];

    // 3. Get all property names from the prototype
    const propertyNames = Object.getOwnPropertyNames(prototype);

    // 4. Iterate through all properties
    for (const propertyName of propertyNames) {
      // Skip constructor
      if (propertyName === "constructor") continue;

      const method = prototype[propertyName];

      // Skip non-functions
      if (typeof method !== "function") continue;

      // 5. Check if method has @Method decorator (or @Get/@Post/etc)
      const methodMeta: MethodMetadata | undefined = Reflect.getMetadata(
        METHOD_METADATA,
        prototype,
        propertyName,
      );

      if (!methodMeta) {
        // Method doesn't have decorator, skip it
        continue;
      }

      // 6. Extract type information using TypeScript reflection
      const paramTypes = Reflect.getMetadata(
        "design:paramtypes",
        prototype,
        propertyName,
      );
      const returnType = Reflect.getMetadata(
        "design:returntype",
        prototype,
        propertyName,
      );

      // 7. Get optional description from @Description decorator
      const description: string | undefined = Reflect.getMetadata(
        DESCRIPTION_METADATA,
        prototype,
        propertyName,
      );

      // 8. Get guard configuration from @Guard decorator
      const guardMetadata = Reflect.getMetadata(
        GUARD_METADATA,
        prototype,
        propertyName,
      );

      let guard: Guard | undefined;

      if (guardMetadata !== undefined) {
        if (guardMetadata === "" || guardMetadata === null) {
          // @Guard() with no argument - use default guard
          if (!defaultGuard) {
            throw new Error(
              `Method "${controllerClass.name}.${propertyName}" uses @Guard() without argument, ` +
                `but no default guard is registered. Call api.registerDefaultGuard(guard) first.`,
            );
          }
          guard = defaultGuard;
        } else {
          // @Guard('name') with named guard
          guard = guardRegistry.get(guardMetadata);
          if (!guard) {
            throw new Error(
              `Guard "${guardMetadata}" not found in registry for method "${controllerClass.name}.${propertyName}". ` +
                `Register it with api.registerGuard('${guardMetadata}', guard)`,
            );
          }
        }
      }

      // 8b. Get parameter metadata from @Param decorator
      const paramMetadata: ParamMetadata[] =
        Reflect.getMetadata(PARAM_METADATA, prototype, propertyName) || [];

      // 9. Determine final path
      let finalPath = methodMeta.path;

      if (finalPath === undefined) {
        // No path provided - use empty string to match controller base path
        finalPath = "";
      }

      // 10. Combine controller path with method path
      // Normalize both paths (handles leading/trailing slashes, multiple slashes)
      const normalizedControllerPath = normalizePath(controllerPath);
      const normalizedMethodPath = normalizePath(finalPath);

      // Combine paths - if both are empty, default to root '/'
      const fullPath = normalizedControllerPath + normalizedMethodPath || "/";

      // 11. Create wrapped handler that injects route params
      const originalHandler = method.bind(instance);
      const wrappedHandler = (input: any, context: any) => {
        // If there are @Param decorators, inject route params
        if (paramMetadata.length > 0 && context?.params) {
          const args: any[] = [];

          // Build arguments array based on param metadata
          for (const param of paramMetadata) {
            const paramValue = context.params[param.paramName];
            args[param.parameterIndex] = paramValue;
          }

          // First parameter is usually input DTO (index 0)
          // If no @Param at index 0, use input parameter
          if (!paramMetadata.find((p) => p.parameterIndex === 0)) {
            args[0] = input;
          }

          return originalHandler(...args);
        }

        // No params, call normally
        return originalHandler(input, context);
      };

      // 12. Create MethodConfig
      const config: MethodConfig = {
        type: methodMeta.type,
        name: fullPath,
        handler: wrappedHandler,
        description,
        inputClass: paramTypes?.[0],
        outputClass: returnType,
        guard,
      };

      methodConfigs.push(config);
    }

    return methodConfigs;
  }
}
