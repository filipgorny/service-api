# Controller Usage Example

This document demonstrates how to use the decorator-based controller system in `@filipgorny/service-api`.

## Overview

Controllers provide a clean, decorator-based way to define API endpoints using TypeScript classes. This approach is similar to NestJS, ASP.NET Core, and other modern frameworks.

## Table of Contents

- [Path Formatting](#path-formatting)
- [Basic Controller](#basic-controller)
- [Auto-derived Controller Paths](#auto-derived-controller-paths)
- [HTTP Method Decorators](#http-method-decorators)
- [Path Auto-generation](#path-auto-generation)
- [Guards & Authentication](#guards--authentication)
- [Complete Example](#complete-example)
- [Migration from Functional API](#migration-from-functional-api)

---

## Path Formatting

All path arguments in decorators are automatically normalized for maximum flexibility:

### Features

- **Leading slashes are optional**: `'users'` and `'/users'` are equivalent
- **Trailing slashes are removed**: `'users/'` becomes `'/users'`
- **Multiple slashes collapsed**: `'///users///'` becomes `'/users'`
- **Empty paths supported**: `@Controller('')` creates a root controller
- **Final paths always properly formatted** with leading slash

### Recommended Style

**Omit leading slashes for cleaner code:**

```typescript
// ✅ Recommended (no leading slashes)
@Controller("api/users")
class UserController {
  @Get(":id")
  async getUser() {}
}

// ✅ Also works (with leading slashes)
@Controller('"api/users")
class UserController {
  @Get('":id")
  async getUser() {}
}
```

Both produce the same result: `GET /api/users/:id`

---

## Basic Controller

A controller is a class decorated with `@Controller` that groups related endpoints together.

```typescript
import { Controller, Get, Post, Description } from "@filipgorny/service-api";

@Controller("users") // No leading slash needed!
class UserController {
  @Get(":id") // No leading slash needed!
  @Description("Get user by ID")
  async getUserById(input: GetUserInput): Promise<UserOutput> {
    return {
      id: input.id,
      name: "John Doe",
      email: "john@example.com",
    };
  }

  @Post()
  @Description("Create a new user")
  async createUser(input: CreateUserInput): Promise<UserOutput> {
    return {
      id: "123",
      name: input.name,
      email: input.email,
    };
  }
}
```

**Result:**

- `GET /users/:id` - Get user by ID
- `POST /users/create-user` - Create user (auto-generated path)

---

## Auto-derived Controller Paths

If `@Controller()` is called without arguments, the path is automatically derived from the class name:

```typescript
@Controller() // No path provided
class UserController {
  @Get(":id")
  async getUser() {}
}
// Result: GET /user/:id (derived from "UserController")

@Controller()
class BlogPostController {
  @Get()
  async getPosts() {}
}
// Result: GET /blog-post/get-posts

@Controller()
class APIController {
  @Get("health")
  async health() {}
}
// Result: GET /api/health
```

**Derivation rules:**

1. Remove "Controller" suffix if present
2. Convert remaining text to kebab-case
3. Add leading slash

---

## HTTP Method Decorators

### Available Decorators

| Decorator        | HTTP Method | Use Case                 |
| ---------------- | ----------- | ------------------------ |
| `@Get(path?)`    | GET         | Read operations, queries |
| `@Post(path?)`   | POST        | Create operations        |
| `@Put(path?)`    | PUT         | Update operations        |
| `@Delete(path?)` | DELETE      | Delete operations        |

### Example: All HTTP Methods

```typescript
@Controller("api/posts") // No leading slash needed
class PostController {
  @Get(":id") // No leading slash needed
  async getPost(input: GetPostInput): Promise<Post> {
    // Read post
  }

  @Post()
  async createPost(input: CreatePostInput): Promise<Post> {
    // Create post
  }

  @Put(":id")
  async updatePost(input: UpdatePostInput): Promise<Post> {
    // Update post
  }

  @Delete(":id")
  async deletePost(input: DeletePostInput): Promise<void> {
    // Delete post
  }
}
```

---

## Path Auto-generation

If you don't provide a path to the decorator, it's automatically generated from the method name using **camelCase → dash-case** conversion.

### Examples

| Method Name         | Generated Path         |
| ------------------- | ---------------------- |
| `getUserById`       | `/get-user-by-id`      |
| `createUser`        | `/create-user`         |
| `updateUserProfile` | `/update-user-profile` |
| `deleteAccount`     | `/delete-account`      |
| `getAPIKey`         | `/get-api-key`         |

### Example

```typescript
@Controller("api") // No leading slash needed
class ApiController {
  @Get() // No path provided - auto-generates 'get-user-list'
  async getUserList(input: GetUsersInput): Promise<UserOutput[]> {
    // GET /api/get-user-list
  }

  @Post() // No path provided - auto-generates 'create-new-account'
  async createNewAccount(input: CreateAccountInput): Promise<Account> {
    // POST /api/create-new-account
  }
}
```

---

## Guards & Authentication

Guards protect endpoints with authentication/authorization logic.

### Step 1: Register Guards

```typescript
import { RestApi, express } from "@filipgorny/service-api";
import { JWTGuard } from "@filipgorny/auth";
import { Container } from "@filipgorny/di";

// Setup DI
const container = new Container();
container.register("SessionManager", sessionManager);

// Create guards
const jwtGuard = container.resolve(JWTGuard);
const adminGuard = new AdminGuard();

// Create API
const api = new RestApi(express(3000));

// Register guards
api
  .registerGuard("jwt", jwtGuard) // Named guard
  .registerGuard("admin", adminGuard) // Named guard
  .registerDefaultGuard(jwtGuard); // Default guard
```

### Step 2: Use Guards in Controllers

```typescript
@Controller("api/users") // No leading slash needed
class UserController {
  // Public endpoint - no guard
  @Get("public")
  async getPublicUsers(): Promise<UserOutput[]> {
    return [];
  }

  // Protected with named guard
  @Get("profile")
  @Guard("jwt")
  async getProfile(input: GetProfileInput): Promise<UserOutput> {
    const user = input.getUser(); // User attached by JWTGuard
    return { id: user.id, name: user.name };
  }

  // Protected with default guard
  @Post()
  @Guard() // Uses default guard
  async createPost(input: CreatePostInput): Promise<Post> {
    const user = input.getUser();
    return { id: "123", author: user.id };
  }

  // Admin-only endpoint
  @Delete(":id")
  @Guard("admin")
  async deleteUser(input: DeleteUserInput): Promise<void> {
    // Only admins can delete users
  }
}
```

### Guard Execution

When a guard is present:

1. Guard's `canActivate()` method is called before the handler
2. If guard throws `AccessDeniedError`, returns HTTP 403
3. If guard returns `false`, returns HTTP 403
4. If guard returns `true`, handler is executed

---

## Complete Example

Here's a complete example showing all features together:

```typescript
import {
  RestApi,
  express,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Description,
  Guard,
} from "@filipgorny/service-api";
import { JWTGuard, AccessDeniedError } from "@filipgorny/auth";
import { Container } from "@filipgorny/di";

// ========================================
// Custom Guard Example
// ========================================
class AdminGuard implements Guard {
  async canActivate(context: any): Promise<boolean> {
    const user = context.getUser?.();

    if (!user) {
      throw new AccessDeniedError("User not authenticated");
    }

    if (user.role !== "admin") {
      throw new AccessDeniedError("Admin access required");
    }

    return true;
  }
}

// ========================================
// Input/Output Types
// ========================================
class GetUserInput {
  id: string;
}

class CreateUserInput {
  name: string;
  email: string;
}

class UpdateUserInput {
  id: string;
  name?: string;
  email?: string;
}

class DeleteUserInput {
  id: string;
}

class UserOutput {
  id: string;
  name: string;
  email: string;
  role?: string;
}

// ========================================
// Controller
// ========================================
@Controller('"api/users")
class UserController {
  @Get()
  @Description("Get all users (public)")
  async getAllUsers(): Promise<UserOutput[]> {
    return [
      { id: "1", name: "John", email: "john@example.com" },
      { id: "2", name: "Jane", email: "jane@example.com" },
    ];
  }

  @Get('":id")
  @Description("Get user by ID")
  @Guard("jwt")
  async getUserById(input: GetUserInput): Promise<UserOutput> {
    return {
      id: input.id,
      name: "John Doe",
      email: "john@example.com",
    };
  }

  @Post()
  @Description("Create a new user")
  @Guard() // Uses default guard
  async createUser(input: CreateUserInput): Promise<UserOutput> {
    const currentUser = input.getUser?.();
    return {
      id: "123",
      name: input.name,
      email: input.email,
    };
  }

  @Put('":id")
  @Description("Update user")
  @Guard("jwt")
  async updateUser(input: UpdateUserInput): Promise<UserOutput> {
    return {
      id: input.id,
      name: input.name || "Updated Name",
      email: input.email || "updated@example.com",
    };
  }

  @Delete('":id")
  @Description("Delete user (admin only)")
  @Guard("admin")
  async deleteUser(input: DeleteUserInput): Promise<void> {
    // Delete user logic
    console.log(`Deleting user ${input.id}`);
  }
}

// ========================================
// API Setup
// ========================================
async function main() {
  // Setup DI
  const container = new Container();
  container.register("SessionManager", sessionManager);
  container.register("Database", database);

  // Create guards
  const jwtGuard = container.resolve(JWTGuard);
  const adminGuard = new AdminGuard();

  // Create API
  const api = new RestApi(express(3000));

  // Register guards
  api
    .registerGuard("jwt", jwtGuard)
    .registerGuard("admin", adminGuard)
    .registerDefaultGuard(jwtGuard);

  // Register controller
  api.registerController(UserController);

  // Start API
  api.run();

  console.log("API running on http://localhost:3000");
  console.log("Registered endpoints:");
  console.log("  GET    /api/users");
  console.log("  GET    /api/users/:id (protected)");
  console.log("  POST   /api/users/create-user (protected)");
  console.log("  PUT    /api/users/:id (protected)");
  console.log("  DELETE /api/users/:id (admin only)");
}

main();
```

---

## Migration from Functional API

### Before (Functional API)

```typescript
const api = new RestApi(express(3000));

api.get("/users/:id", async (input: GetUserInput) => {
  return { id: input.id, name: "John" };
});

api.create("/users", async (input: CreateUserInput) => {
  return { id: "123", name: input.name };
});

api.run();
```

### After (Controller API)

```typescript
@Controller('"users")
class UserController {
  @Get('":id")
  async getUserById(input: GetUserInput): Promise<UserOutput> {
    return { id: input.id, name: "John" };
  }

  @Post()
  async createUser(input: CreateUserInput): Promise<UserOutput> {
    return { id: "123", name: input.name };
  }
}

const api = new RestApi(express(3000));
api.registerController(UserController);
api.run();
```

---

## Benefits of Controllers

1. **Organization**: Group related endpoints in one class
2. **Type Safety**: Full TypeScript support with decorators
3. **Reusability**: Share guards across multiple controllers
4. **Testability**: Easy to test controller methods in isolation
5. **Readability**: Clear, declarative syntax
6. **Auto-generation**: Automatic path generation from method names
7. **Documentation**: Self-documenting code with decorators

---

## Error Handling

### Missing @Controller Decorator

```typescript
class BadController {
  // ❌ Missing @Controller
  @Get('"users")
  async getUsers() {}
}

api.registerController(BadController);
// Error: Class "BadController" must have @Controller decorator
```

### Unknown Guard

```typescript
@Controller('"users")
class UserController {
  @Get('":id")
  @Guard("unknown") // ❌ Guard not registered
  async getUser() {}
}

// Error: Guard "unknown" not found in registry
```

### Missing Default Guard

```typescript
@Controller('"users")
class UserController {
  @Get('":id")
  @Guard() // ❌ No default guard registered
  async getUser() {}
}

// Error: Method uses @Guard() without argument, but no default guard is registered
```

---

## Advanced Features

### Multiple Controllers

```typescript
api
  .registerGuard("jwt", jwtGuard)
  .registerController(UserController)
  .registerController(PostController)
  .registerController(CommentController)
  .run();
```

### Nested Paths

```typescript
@Controller('"api/v1/users")
class UserController {
  @Get('":id/posts")
  async getUserPosts(input: GetUserPostsInput): Promise<Post[]> {
    // GET /api/v1/users/:id/posts
  }
}
```

### Method Chaining

```typescript
api
  .registerGuard("jwt", jwtGuard)
  .registerGuard("admin", adminGuard)
  .registerDefaultGuard(jwtGuard)
  .registerController(UserController)
  .registerController(PostController)
  .run();
```

---

## TypeScript Configuration

Make sure your `tsconfig.json` has these settings:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2020",
    "module": "commonjs"
  }
}
```

---

## Summary

Controllers provide a powerful, type-safe way to build APIs with `@filipgorny/service-api`. They offer:

- Clean, declarative syntax with decorators
- Automatic type inference from method signatures
- Built-in guard support for authentication/authorization
- Path auto-generation from method names
- Full backward compatibility with functional API

Happy coding! 🚀
