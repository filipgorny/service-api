export class ResourceNotFoundError extends Error {
  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "ResourceNotFoundError";

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ResourceNotFoundError);
    }
  }
}
