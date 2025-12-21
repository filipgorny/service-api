"use strict";
/**
 * Example demonstrating controller usage
 * This file shows how to use the new controller decorator system
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const index_1 = require("./src/index");
// Example Guard
class ExampleGuard {
    async canActivate(context) {
        console.log("✓ ExampleGuard.canActivate called");
        return true;
    }
}
// Input/Output types
class GetUserInput {
}
class CreateUserInput {
}
class UserOutput {
}
// Example Controller
let UserController = class UserController {
    async getUserById(input) {
        console.log(`  Handler: getUserById(${input.id})`);
        return {
            id: input.id,
            name: "John Doe",
            email: "john@example.com",
        };
    }
    async createUser(input) {
        console.log(`  Handler: createUser(${input.name}, ${input.email})`);
        return {
            id: "123",
            name: input.name,
            email: input.email,
        };
    }
    async updateUser(input) {
        console.log(`  Handler: updateUser(${input.id})`);
        return {
            id: input.id,
            name: "Updated User",
            email: "updated@example.com",
        };
    }
    async deleteUser(input) {
        console.log(`  Handler: deleteUser(${input.id})`);
    }
};
__decorate([
    (0, index_1.Get)("/:id"),
    (0, index_1.Description)("Get user by ID"),
    (0, index_1.GuardDecorator)("example"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GetUserInput]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserById", null);
__decorate([
    (0, index_1.Post)(),
    (0, index_1.Description)("Create a new user"),
    (0, index_1.GuardDecorator)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateUserInput]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createUser", null);
__decorate([
    (0, index_1.Put)("/:id"),
    (0, index_1.Description)("Update user"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GetUserInput]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, index_1.Delete)("/:id"),
    (0, index_1.Description)("Delete user"),
    (0, index_1.GuardDecorator)("example"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GetUserInput]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
UserController = __decorate([
    (0, index_1.Controller)("/api/users")
], UserController);
// Example usage
async function main() {
    console.log("🚀 Controller Decorator Example\n");
    console.log("=".repeat(60));
    // Create API
    const api = new index_1.RestApi((0, index_1.express)(3000), false); // Don't add default methods
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
