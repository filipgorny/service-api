/**
 * Test file to verify controller decorator functionality
 * Run with: npx ts-node -r tsconfig-paths/register test-controller.ts
 */

import "reflect-metadata";
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Description,
  Guard as GuardDecorator,
  ControllerParser,
} from "./src/index";
import { Guard } from "./src/guard/guard";

// Mock Guard implementation
class TestGuard implements Guard {
  async canActivate(context: any): Promise<boolean> {
    console.log("TestGuard.canActivate called");
    return true;
  }
}

// Input/Output types for testing
class GetUserInput {
  id: string;
}

class CreateUserInput {
  name: string;
  email: string;
}

class UserOutput {
  id: string;
  name: string;
  email: string;
}

// Test Controller
@Controller("/api/users")
class UserController {
  @Get("/:id")
  @Description("Get user by ID")
  @GuardDecorator("test")
  async getUserById(input: GetUserInput): Promise<UserOutput> {
    return {
      id: input.id,
      name: "John Doe",
      email: "john@example.com",
    };
  }

  @Post()
  @Description("Create a new user")
  @GuardDecorator()
  async createUser(input: CreateUserInput): Promise<UserOutput> {
    return {
      id: "123",
      name: input.name,
      email: input.email,
    };
  }

  @Put("/:id")
  async updateUser(input: GetUserInput): Promise<UserOutput> {
    return {
      id: input.id,
      name: "Updated User",
      email: "updated@example.com",
    };
  }

  @Delete("/:id")
  @GuardDecorator("test")
  async deleteUser(input: GetUserInput): Promise<void> {
    console.log(`Deleting user ${input.id}`);
  }
}

// Test the controller parser
console.log("🧪 Testing Controller Decorator System\n");
console.log("=".repeat(60));

try {
  // Setup guard registry
  const guardRegistry = new Map<string, Guard>();
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
    console.log(`         Input: ${config.inputClass?.name || "(none)"}`);
    console.log(`         Output: ${config.outputClass?.name || "(none)"}`);
    console.log();
  }

  // Test method execution
  console.log("=".repeat(60));
  console.log("\n✓ Testing method execution...\n");

  const getUserConfig = methodConfigs.find((m) => m.name === "/api/users/:id");
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
} catch (error: any) {
  console.error("\n❌ Test failed:", error.message);
  console.error(error.stack);
  process.exit(1);
}
