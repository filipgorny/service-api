import { MethodType } from "@/method/method-type";
import { MethodConfig } from "@/method/method-config";

/**
 * Metadata keys for controller decorators
 * Using symbols to avoid conflicts with user-defined properties
 */
export const CONTROLLER_PATH_METADATA = Symbol("controller:path");
export const METHOD_METADATA = Symbol("method:metadata");
export const DESCRIPTION_METADATA = Symbol("method:description");
export const GUARD_METADATA = Symbol("method:guard");

/**
 * Metadata stored by @Method and HTTP method decorators
 */
export interface MethodMetadata {
  /** Method type (GET, CREATE, UPDATE, DELETE) */
  type: MethodType;
  /** Optional path for the method (if not provided, auto-generated from method name) */
  path?: string;
  /** Method name from the class */
  propertyKey: string;
}

/**
 * Complete controller metadata after parsing
 */
export interface ControllerMetadata {
  /** Base path for the controller */
  path: string;
  /** Map of method name to MethodConfig */
  methods: Map<string, MethodConfig>;
}
