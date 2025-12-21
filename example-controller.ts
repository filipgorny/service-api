/**
 * Example demonstrating controller usage
 * This file shows how to use the new controller decorator system
 */

import "reflect-metadata";
import {
  RestApi,
  express,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Description,
  GuardDecorator,
} from "./src/index";
import { Guard } from "./src/guard/guard";

// Example Guard
class ExampleGuard implements Guard {
  async canActivate(context: any): Promise<boolean> {
    console.log("✓ ExampleGuard.canActivate called");
    return true;
  }
}

// Input/Output types
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

// Example Controller
@Controller("/api/users")
class UserController {
  @Get("/:id")
  @Description("Get user by ID")
  @GuardDecorator("example")
  async getUserById(input: GetUserInput): Promise<UserOutput> {
    console.log(`  Handler: getUserById(${input.id})`);
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
    console.log(`  Handler: createUser(${input.name}, ${input.email})`);
    return {
      id: "123",
      name: input.name,
      email: input.email,
    };
  }

  @Put("/:id")
  @Description("Update user")
  async updateUser(input: GetUserInput): Promise<UserOutput> {
    console.log(`  Handler: updateUser(${input.id})`);
    return {
      id: input.id,
      name: "Updated User",
      email: "updated@example.com",
    };
  }

  @Delete("/:id")
  @Description("Delete user")
  @GuardDecorator("example")
  async deleteUser(input: GetUserInput): Promise<void> {
    console.log(`  Handler: deleteUser(${input.id})`);
  }
}

// Example usage
async function main() {
  console.log("🚀 Controller Decorator Example\n");
  console.log("=".repeat(60));

  // Create API
  const api = new RestApi(express(3000), false); // Don't add default methods

  // Register guards
  const exampleGuard = new ExampleGuard();
  api.registerGuard("example", exampleGuard).registerDefaultGuard(exampleGuard);

  console.log("\n📝 Registering controller...\n");

  // Register controller
  api.registerController(UserController);

  console.log("\n✅ Controller registered successfully!");
  console.log("=".repeat(60));

  console.log("\n📋 Registered endpoints:");
  for (const method of api.getMethods().getAll()) {
    console.log(`  ${method.type.toUpperCase().padEnd(6)} ${method.name}`);
    if (method.description) {
      console.log(`         ${method.description}`);
    }
    if (method.guard) {
      console.log(`         🔒 Protected with guard`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n✨ Example complete! Controller decorators are working.\n");
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
