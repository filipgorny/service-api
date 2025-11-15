// Type definition for API method handlers
export type Handler<TInput = any, TOutput = any> = (
  input?: TInput,
) => Promise<TOutput>;
