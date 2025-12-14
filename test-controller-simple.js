/**
 * Simple JavaScript test to verify controller functionality
 * Run with: node test-controller-simple.js
 */

require("reflect-metadata");
const {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Description,
  GuardDecorator,
  ControllerParser,
} = require("./dist/index.js");

// Mock Guard implementation
class TestGuard {
  async canActivate(context) {
    console.log("TestGuard.canActivate called");
    return true;
  }
}

// Input/Output classes
class GetUserInput {
  constructor(id) {
    this.id = id;
  }
}

class CreateUserInput {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

class UserOutput {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }
}

// Test Controller with decorators
const UserController = Controller("/api/users")(
  class UserController {
    getUserById(input) {
      return Promise.resolve(
        new UserOutput(input.id, "John Doe", "john@example.com"),
      );
    }

    createUser(input) {
      return Promise.resolve(new UserOutput("123", input.name, input.email));
    }

    updateUser(input) {
      return Promise.resolve(
        new UserOutput(input.id, "Updated User", "updated@example.com"),
      );
    }

    deleteUser(input) {
      console.log(`Deleting user ${input.id}`);
      return Promise.resolve();
    }
  },
);

// Apply method decorators
const proto = UserController.prototype;

// getUserById
Get("/:id")(
  proto,
  "getUserById",
  Object.getOwnPropertyDescriptor(proto, "getUserById"),
);
Description("Get user by ID")(proto, "getUserById");
GuardDecorator("test")(proto, "getUserById");

// createUser
Post()(
  proto,
  "createUser",
  Object.getOwnPropertyDescriptor(proto, "createUser"),
);
Description("Create a new user")(proto, "createUser");
GuardDecorator()(proto, "createUser");

// updateUser
Put("/:id")(
  proto,
  "updateUser",
  Object.getOwnPropertyDescriptor(proto, "updateUser"),
);

// deleteUser
Delete("/:id")(
  proto,
  "deleteUser",
  Object.getOwnPropertyDescriptor(proto, "deleteUser"),
);
GuardDecorator("test")(proto, "deleteUser");

// Test the controller parser
console.log("🧪 Testing Controller Decorator System\n");
console.log("=".repeat(60));

async function runTests() {
  try {
    // Setup guard registry
    const guardRegistry = new Map();
    const testGuard = new TestGuard();
    guardRegistry.set("test", testGuard);

    // Parse the controller
    console.log("\n✓ Parsing UserController...");
    const methodConfigs = ControllerParser.parse(
      UserController,
      guardRegistry,
      testGuard, // default guard
    );

    console.log(`\n✓ Found ${methodConfigs.length} methods:\n`);

    // Display parsed methods
    for (const config of methodConfigs) {
      console.log(`  ${config.type.toUpperCase().padEnd(6)} ${config.name}`);
      console.log(`         Description: ${config.description || "(none)"}`);
      console.log(`         Guard: ${config.guard ? "✓" : "✗"}`);
      console.log();
    }

    // Test method execution
    console.log("=".repeat(60));
    console.log("\n✓ Testing method execution...\n");

    const getUserConfig = methodConfigs.find(
      (m) => m.name === "/api/users/:id",
    );
    if (getUserConfig) {
      const result = await getUserConfig.handler({ id: "42" });
      console.log("  GET /api/users/:id result:", result);
    }

    const createUserConfig = methodConfigs.find(
      (m) => m.name === "/api/users/create-user",
    );
    if (createUserConfig) {
      const result = await createUserConfig.handler({
        name: "Jane",
        email: "jane@example.com",
      });
      console.log("  POST /api/users/create-user result:", result);
    }

    console.log("\n✅ All tests passed!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runTests();
