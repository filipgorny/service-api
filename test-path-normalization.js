/**
 * Test path normalization features
 * Run with: node test-path-normalization.js
 */

require("reflect-metadata");
const { Controller, Get, Post, ControllerParser } = require("./dist/index.js");

console.log("🧪 Testing Path Normalization Features\n");
console.log("=".repeat(60));

// Test 1: Controller without leading slash
const TestController1 = Controller("api/users")(
  class UserController {
    getUserById() {
      return Promise.resolve({ id: "1" });
    }
    createUser() {
      return Promise.resolve({ id: "2" });
    }
  },
);

// Apply decorators
Get(":id")(
  TestController1.prototype,
  "getUserById",
  Object.getOwnPropertyDescriptor(TestController1.prototype, "getUserById"),
);
Post("")(
  TestController1.prototype,
  "createUser",
  Object.getOwnPropertyDescriptor(TestController1.prototype, "createUser"),
);

// Test 2: Controller with leading slash
const TestController2 = Controller("/products")(
  class ProductController {
    getProduct() {
      return Promise.resolve({ id: "p1" });
    }
  },
);

Get("/:id")(
  TestController2.prototype,
  "getProduct",
  Object.getOwnPropertyDescriptor(TestController2.prototype, "getProduct"),
);

// Test 3: Auto-derived controller path
const TestController3 = Controller()(
  class BlogPostController {
    getPost() {
      return Promise.resolve({ id: "post1" });
    }
  },
);

Get("")(
  TestController3.prototype,
  "getPost",
  Object.getOwnPropertyDescriptor(TestController3.prototype, "getPost"),
);

// Test 4: Multiple slashes
const TestController4 = Controller("///api///v1///")(
  class APIController {
    health() {
      return Promise.resolve({ status: "ok" });
    }
  },
);

Get("///health///")(
  TestController4.prototype,
  "health",
  Object.getOwnPropertyDescriptor(TestController4.prototype, "health"),
);

// Parse all controllers
const testCases = [
  {
    name: "No leading slash",
    controller: TestController1,
    expected: ["/api/users/:id", "/api/users/create-user"],
  },
  {
    name: "With leading slash",
    controller: TestController2,
    expected: ["/products/:id"],
  },
  {
    name: "Auto-derived path",
    controller: TestController3,
    expected: ["/blog-post/get-post"],
  },
  {
    name: "Multiple slashes",
    controller: TestController4,
    expected: ["/api/v1/health"],
  },
];

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);

  try {
    const methods = ControllerParser.parse(
      testCase.controller,
      new Map(),
      undefined,
    );

    const actualPaths = methods.map((m) => m.name).sort();
    const expectedPaths = testCase.expected.sort();

    console.log("   Expected:", expectedPaths.join(", "));
    console.log("   Actual:  ", actualPaths.join(", "));

    const match = JSON.stringify(actualPaths) === JSON.stringify(expectedPaths);

    if (match) {
      console.log("   ✅ PASS");
      passed++;
    } else {
      console.log("   ❌ FAIL");
      failed++;
    }
  } catch (error) {
    console.log("   ❌ ERROR:", error.message);
    failed++;
  }
});

console.log("\n" + "=".repeat(60));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log("✅ All path normalization tests passed!\n");
  process.exit(0);
} else {
  console.log("❌ Some tests failed\n");
  process.exit(1);
}
