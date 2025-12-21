/**
 * Normalizes a URL path by:
 * - Ensuring it starts with "/" (unless empty)
 * - Removing trailing slashes
 * - Collapsing multiple consecutive slashes to single slash
 *
 * @param path - Path to normalize
 * @returns Normalized path
 *
 * @example
 * normalizePath('users')           // => '/users'
 * normalizePath('/users')          // => '/users'
 * normalizePath('users/')          // => '/users'
 * normalizePath('///users///')     // => '/users'
 * normalizePath('')                // => ''
 * normalizePath('/')               // => ''
 * normalizePath('api/users')       // => '/api/users'
 * normalizePath('/api//users/')    // => '/api/users'
 * normalizePath(':id')             // => '/:id'
 */
export function normalizePath(path: string): string {
  // Handle empty or root path
  if (!path || path === "/") {
    return "";
  }

  // Collapse multiple slashes to single slash
  let normalized = path.replace(/\/+/g, "/");

  // Ensure leading slash
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  // Remove trailing slash
  normalized = normalized.replace(/\/$/, "");

  return normalized;
}
