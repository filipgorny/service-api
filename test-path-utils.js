/**
 * Test path normalization utility functions
 * Run with: node test-path-utils.js
 */

const { normalizePath } = require("./dist/utils/normalize-path.js");
const {
  deriveControllerPath,
} = require("./dist/utils/derive-controller-path.js");
const { camelToDashCase } = require("./dist/utils/camel-to-dash-case.js");

console.log("🧪 Testing Path Utilities\n");
console.log("=".repeat(60));

// Test normalizePath
const normalizeTests = [
  { input: "users", expected: "/users" },
  { input: "/users", expected: "/users" },
  { input: "users/", expected: "/users" },
  { input: "/users/", expected: "/users" },
  { input: "///users///", expected: "/users" },
  { input: "", expected: "" },
  { input: "/", expected: "" },
  { input: "api/users", expected: "/api/users" },
  { input: "/api//users/", expected: "/api/users" },
  { input: ":id", expected: "/:id" },
  { input: "/:id", expected: "/:id" },
];

console.log("\n1. Testing normalizePath():\n");
let passed = 0;
let failed = 0;

normalizeTests.forEach((test) => {
  const result = normalizePath(test.input);
  const match = result === test.expected;

  console.log(
    `   ${match ? "✅" : "❌"} normalizePath('${test.input}') => '${result}' ${!match ? `(expected '${test.expected}')` : ""}`,
  );

  if (match) passed++;
  else failed++;
});

// Test deriveControllerPath
const deriveTests = [
  { input: "UserController", expected: "/user" },
  { input: "BlogPostController", expected: "/blog-post" },
  { input: "APIController", expected: "/api" },
  { input: "AdminDashboard", expected: "/admin-dashboard" },
  { input: "Controller", expected: "/controller" }, // Edge case
  { input: "RootController", expected: "/root" },
];

console.log("\n2. Testing deriveControllerPath():\n");

deriveTests.forEach((test) => {
  const result = deriveControllerPath(test.input);
  const match = result === test.expected;

  console.log(
    `   ${match ? "✅" : "❌"} deriveControllerPath('${test.input}') => '${result}' ${!match ? `(expected '${test.expected}')` : ""}`,
  );

  if (match) passed++;
  else failed++;
});

// Test camelToDashCase
const camelTests = [
  { input: "getUserById", expected: "get-user-by-id" },
  { input: "createUser", expected: "create-user" },
  { input: "API", expected: "api" },
  { input: "getAPIKey", expected: "get-api-key" },
  { input: "user", expected: "user" },
];

console.log("\n3. Testing camelToDashCase():\n");

camelTests.forEach((test) => {
  const result = camelToDashCase(test.input);
  const match = result === test.expected;

  console.log(
    `   ${match ? "✅" : "❌"} camelToDashCase('${test.input}') => '${result}' ${!match ? `(expected '${test.expected}')` : ""}`,
  );

  if (match) passed++;
  else failed++;
});

// Summary
console.log("\n" + "=".repeat(60));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log("✅ All path utility tests passed!\n");
  process.exit(0);
} else {
  console.log("❌ Some tests failed\n");
  process.exit(1);
}
