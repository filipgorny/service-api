/**
 * Converts camelCase string to dash-case
 * @param str - String in camelCase format
 * @returns String in dash-case format
 *
 * @example
 * camelToDashCase('getUserById') // => 'get-user-by-id'
 * camelToDashCase('createUser') // => 'create-user'
 * camelToDashCase('API') // => 'api'
 * camelToDashCase('getAPIKey') // => 'get-api-key'
 */
export function camelToDashCase(str: string): string {
  return (
    str
      // Insert dash before uppercase letters
      .replace(/([A-Z])/g, "-$1")
      // Convert to lowercase
      .toLowerCase()
      // Remove leading dash if present
      .replace(/^-/, "")
  );
}
