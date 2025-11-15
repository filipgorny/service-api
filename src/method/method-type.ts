// Method type enum - generic operation types (not HTTP-specific)
export enum MethodType {
  GET = "get", // Read operations, health checks, info endpoints
  CREATE = "create", // Create operations
  UPDATE = "update", // Update operations
  DELETE = "delete", // Delete operations
}
