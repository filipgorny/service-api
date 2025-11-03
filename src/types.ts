import { ClassType } from "@filipgorny/types";

// Interface defining the structure of an API endpoint

// Optional output class; if undefined, endpoint returns no content (e.g., deletions)
// Handler function that processes input and returns a promise of any (output or void)
export interface EndpointDefinition<T extends ClassType> {
  inputClass: T;
  outputClass?: ClassType;
  handler: (input: InstanceType<T>) => Promise<any>;
  method: "POST" | "GET" | "PUT" | "DELETE";
  path: string;
  description?: string;
}
