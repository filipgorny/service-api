import { camelToDashCase } from "./camel-to-dash-case";

/**
 * Derives a controller path from the class name
 * - Removes "Controller" suffix if present (case-insensitive)
 * - Converts to kebab-case
 * - Normalizes to URL-friendly format
 *
 * @param className - Name of the controller class
 * @returns Derived path with leading slash
 *
 * @example
 * deriveControllerPath('UserController')        // => '/user'
 * deriveControllerPath('BlogPostController')    // => '/blog-post'
 * deriveControllerPath('APIController')         // => '/api'
 * deriveControllerPath('AdminDashboard')        // => '/admin-dashboard'
 * deriveControllerPath('RootController')        // => '/root'
 */
export function deriveControllerPath(className: string): string {
  // Remove "Controller" suffix if present (case-insensitive)
  let name = className;
  if (name.toLowerCase().endsWith("controller")) {
    name = name.slice(0, -10); // Remove last 10 characters ("Controller")
  }

  // If name is empty after removing suffix, use original
  if (!name) {
    name = className;
  }

  // Convert to kebab-case
  const kebabCase = camelToDashCase(name);

  // Add leading slash
  return `/${kebabCase}`;
}
