import { ClassType } from "@filipgorny/types";
import { MethodType } from "./method-type";
import { Guard } from "@/guard/guard";

/**
 * Configuration object for defining API methods
 * Provides a flexible way to configure methods with all options in a single object
 */
export interface MethodConfig {
  /** HTTP/GraphQL method type (GET, CREATE, UPDATE, DELETE) */
  type: MethodType;

  /** Method name/path */
  name: string;

  /** Handler function that processes the request */
  handler: (input: any) => Promise<any>;

  /** Optional description of the method */
  description?: string;

  /** Input class for type validation and transformation */
  inputClass?: ClassType;

  /** Output class for response type information */
  outputClass?: ClassType;

  /** Optional guard to protect the method */
  guard?: Guard;
}
