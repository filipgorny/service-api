# Guard Usage Example

This document demonstrates how to use the new guard-based authentication system instead of decorators on input types.

## Overview

The guard system allows you to protect API methods by specifying guards in the `MethodConfig`. Guards are executed before the method handler and can throw `AccessDeniedError` to deny access.

## Basic Usage

### 1. Using MethodConfig with Guard

Instead of using the legacy Method constructor, use `MethodConfig`:

```typescript
import { RestApi, MethodConfig, MethodType } from "@filipgorny/service-api";
import { JWTGuard, AccessDeniedError } from "@filipgorny/auth";
import { Container } from "@filipgorny/di";

// Setup DI container with SessionManager
const container = new Container();
container.register("SessionManager", sessionManager);
container.register("Database", database);

// Create JWTGuard instance using DI
const jwtGuard = container.resolve(JWTGuard);

// Define protected endpoint using MethodConfig
const api = new RestApi();

const getUserProfileConfig: MethodConfig = {
  type: MethodType.GET,
  name: "user/profile",
  description: "Get current user profile",
  handler: async (input: GetProfileInput) => {
    // Access user from context (set by JWTGuard)
    const user = input.getUser();
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  },
  inputClass: GetProfileInput,
  outputClass: ProfileOutput,
  guard: jwtGuard, // Protect this endpoint with JWT authentication
};

api.registerMethod(new Method(getUserProfileConfig));
```

### 2. Legacy Method Constructor (Still Supported)

The old constructor still works for backward compatibility:

```typescript
api.get("health", async () => {
  return { status: "ok" };
});
```

## Creating Custom Guards

You can create custom guards by implementing the `Guard` interface:

```typescript
import { Guard } from "@filipgorny/service-api";
import { AccessDeniedError } from "@filipgorny/auth";

export class AdminGuard implements Guard {
  async canActivate(context: any): Promise<boolean> {
    // Get user from context (assumes JWTGuard ran first)
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
```

## Error Handling

### REST API

When a guard throws `AccessDeniedError`, the REST API automatically returns:

```json
{
  "error": "Forbidden",
  "message": "Access denied message"
}
```

with HTTP status code `403`.

### GraphQL API

GraphQL error handling for guards will be implemented in the future.

## Migration from Decorator-Based Auth

### Before (Old Way - Not Recommended)

```typescript
import { isAuth } from "@filipgorny/auth";

@isAuth
class CreatePostInput {
  title: string;
  content: string;
}

api.create("posts", async (input: CreatePostInput) => {
  // handler
});
```

### After (New Way - Recommended)

```typescript
import { Method, MethodConfig, MethodType } from "@filipgorny/service-api";
import { JWTGuard } from "@filipgorny/auth";

class CreatePostInput {
  title: string;
  content: string;
}

const createPostConfig: MethodConfig = {
  type: MethodType.CREATE,
  name: "posts",
  handler: async (input: CreatePostInput) => {
    // Access authenticated user from context
    const user = input.getUser();
    // handler implementation
  },
  inputClass: CreatePostInput,
  guard: jwtGuard, // Authentication is specified here, not on the input class
};

api.registerMethod(new Method(createPostConfig));
```

## Benefits of Guard-Based Approach

1. **Separation of Concerns**: Authentication logic is separate from data models
2. **Flexibility**: Easy to compose multiple guards or create custom guards
3. **DI Integration**: Guards can use dependency injection for SessionManager, Database, etc.
4. **Better Testing**: Guards can be mocked and tested independently
5. **Reusability**: Same guard instance can be used across multiple endpoints
6. **Type Safety**: Input classes remain pure DTOs without authentication metadata

## Complete Example

```typescript
import {
  RestApi,
  Method,
  MethodConfig,
  MethodType,
} from "@filipgorny/service-api";
import { JWTGuard, AccessDeniedError } from "@filipgorny/auth";
import { Container } from "@filipgorny/di";
import { SessionManager, UserCatalog } from "@filipgorny/auth";
import { Database } from "@filipgorny/schema";

// Setup
const container = new Container();
container.register("Database", database);
container.register("SessionManager", sessionManager);

const jwtGuard = container.resolve(JWTGuard);

// API
const api = new RestApi();

// Public endpoint - no guard
api.get("health", async () => ({ status: "ok" }));

// Protected endpoint - with JWTGuard
api.registerMethod(
  new Method({
    type: MethodType.GET,
    name: "user/profile",
    handler: async (input) => {
      const user = input.getUser();
      return { id: user.id, email: user.email };
    },
    guard: jwtGuard,
  }),
);

// Admin-only endpoint - with custom guard
const adminGuard = new AdminGuard();
api.registerMethod(
  new Method({
    type: MethodType.DELETE,
    name: "admin/users/:userId",
    handler: async (input) => {
      // Only admins can access this
      await deleteUser(input.userId);
    },
    guard: adminGuard,
  }),
);

api.run(express(3000));
```

## Notes

- Guards are executed **before** the method handler
- Guards can modify the context (e.g., attach user session)
- Multiple guards can be composed by creating a custom guard that calls others
- `AccessDeniedError` is caught by the strategy and returns appropriate error responses
