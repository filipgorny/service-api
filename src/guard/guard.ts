/**
 * Guard interface for protecting API methods
 * Guards are executed before method handlers to implement security checks
 */
export interface Guard {
  /**
   * Execute the guard check
   * @param context - Execution context containing request information
   * @returns Promise that resolves to true if access is allowed, false otherwise
   * @throws Error if guard execution fails
   */
  canActivate(context: any): Promise<boolean>;
}
