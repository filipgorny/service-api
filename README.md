# @filipgorny/service-api

A TypeScript library for defining protocol-agnostic service APIs with automatic validation, type safety, and flexible strategies.

## Features

- ✅ **Protocol-agnostic architecture** - Abstract `Api` class allows REST, GraphQL, gRPC implementations
- ✅ **REST API ready** - `RestApi` implementation with Express strategy
- ✅ **Strategy pattern** - Easily switch between different protocols and transports
- ✅ **Type-safe** - Full TypeScript support with automatic type extraction via reflect-metadata
- ✅ **Automatic validation** - Using class-validator decorators
- ✅ **Built-in endpoints** - `/health` and `/Documentation` available by default
- ✅ **Built-in CORS** - Enabled by default for all REST routes
- ✅ **URL params support** - Automatic handling of route parameters (e.g., `/book/:id`)
- ✅ **Error handling** - Automatic try-catch with proper HTTP error responses
- ✅ **Zero config** - Services work from the start with sensible defaults

## Installation

```bash
npm add @filipgorny/service-api
# or
pnpm add @filipgorny/service-api
```

## Quick Start

### 1. Configure TypeScript

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### 2. Create a REST API Service

```typescript
import { RestApi, express } from "@filipgorny/service-api";

// Create REST API with Express strategy
const api = new RestApi(express(3000));

// Define a simple endpoint
api.get("hello", async () => {
  return { message: "Hello World!" };
});

// Start the server
api.run();
```

**That's it!** Your service is now running with:

- `GET /hello` - Your custom endpoint
- `GET /health` - Health check with version and uptime
- `GET /Documentation` - API documentation

### 3. Full CRUD Example

```typescript
import { RestApi, express } from "@filipgorny/service-api";

class CreateBookInput {
  title: string;
  author: string;
}

class Book {
  id: number;
  title: string;
  author: string;
  available: boolean;
}

// Mock database
const books: Book[] = [];
let nextId = 1;

const api = new RestApi(express(3000));

// GET /books - List all books
api.get("books", async () => {
  return { books };
});

// GET /book/:id - Get book by ID
api.get("book/:id", async (input: { id: number }) => {
  const book = books.find((b) => b.id === input.id);
  if (!book) throw new Error("Book not found");
  return book;
});

// POST /book - Create a new book
api.create("book", async (input: CreateBookInput) => {
  const book = {
    id: nextId++,
    title: input.title,
    author: input.author,
    available: true,
  };
  books.push(book);
  return book;
});

// PUT /book/:id - Update a book
api.update("book/:id", async (input: Partial<Book> & { id: number }) => {
  const book = books.find((b) => b.id === input.id);
  if (!book) throw new Error("Book not found");
  Object.assign(book, input);
  return book;
});

// DELETE /book/:id - Delete a book
api.delete("book/:id", async (input: { id: number }) => {
  const index = books.findIndex((b) => b.id === input.id);
  if (index === -1) throw new Error("Book not found");
  books.splice(index, 1);
});

api.run();
```

## API Architecture

### Base `Api` Class (Abstract)

The abstract `Api` class is protocol-agnostic and can be extended for different API types:

```typescript
import { Api } from "@filipgorny/service-api";

// Future implementations could include:
// - GraphQLApi extends Api
// - GrpcApi extends Api
// - WebSocketApi extends Api
```

### `RestApi` Class

REST-specific implementation with HTTP methods:

```typescript
class RestApi extends Api {
  get<TInput, TOutput>(options, handler): this;
  create<TInput, TOutput>(options, handler): this; // Maps to POST
  update<TInput, TOutput>(options, handler): this; // Maps to PUT
  delete<TInput>(options, handler): this; // Maps to DELETE
}
```

### Method Options

You can pass either a string (route name) or an object with more details:

```typescript
// Simple string
api.get("users", handler);

// With description
api.get({ name: "users", description: "Get all users" }, handler);
```

## REST API Methods

All methods accept route name/options and a handler function:

- **`get<TInput, TOutput>(options, handler)`** - GET endpoint for reading data
- **`create<TInput, TOutput>(options, handler)`** - POST endpoint for creating resources
- **`update<TInput, TOutput>(options, handler)`** - PUT endpoint for updating resources
- **`delete<TInput>(options, handler)`** - DELETE endpoint for deleting resources

## Built-in Default Endpoints

Every REST API automatically includes:

### `GET /health`

Health check endpoint for monitoring:

```json
{
  "status": "healthy",
  "version": "0.0.3",
  "timestamp": "2025-11-09T12:00:00.000Z",
  "uptime": 123.456
}
```

### `GET /Documentation`

API documentation endpoint (returns HTML when using OpenAPI view).

## URL Parameters

The Express strategy automatically handles URL parameters:

```typescript
api.get("book/:id", async (input: { id: number }) => {
  // input.id is automatically parsed from URL
  // Numeric strings are converted to numbers
  return books.find((b) => b.id === input.id);
});

// Also works with multiple params
api.get(
  "author/:authorId/book/:bookId",
  async (input: { authorId: number; bookId: number }) => {
    // Both params available in input
  },
);
```

## Input Handling

The library merges URL params, query params, and request body:

- **GET requests**: `req.query` + `req.params`
- **POST/PUT/DELETE requests**: `req.body` + `req.params`
- **URL params take precedence** over body/query

```typescript
// GET /book/123?format=json
api.get("book/:id", async (input: { id: number; format?: string }) => {
  // input = { id: 123, format: 'json' }
});
```

## Error Handling

All endpoint handlers are automatically wrapped in try-catch:

- **Handler errors** → `500 Internal Server Error`

```json
{
  "error": "Internal service error",
  "message": "Book not found"
}
```

Errors are automatically logged (suppressed in test environments).

## Strategies

### Express Strategy

The default REST strategy using Express.js:

```typescript
import { express } from "@filipgorny/service-api";

const api = new RestApi(express(3000));
```

Features:

- Built-in CORS support
- JSON body parsing
- Automatic route registration
- URL parameter parsing with type conversion

### Future Strategies

The architecture supports future strategies:

- GraphQL strategy
- gRPC strategy
- WebSocket strategy
- Custom strategies implementing the `Strategy` interface

## Advanced Usage

### Disable Default Methods

```typescript
const api = new RestApi(express(3000), false); // No /health or /Documentation
```

### Access Strategy Internals

```typescript
const api = new RestApi(express(3000));

// Configure routes
api.get("users", handler);

// Access Express app (for testing or custom middleware)
const strategy = (api as any).strategy;
const app = strategy.app;
```

## Testing

The library includes comprehensive tests demonstrating all features. See:

- `tests/api.test.ts` - Basic API tests
- `tests/rest-api-full.test.ts` - Complete CRUD workflow tests

## Dependencies

- `express` - HTTP server (for REST)
- `cors` - CORS middleware
- `class-validator` - Validation decorators
- `class-transformer` - DTO transformation
- `reflect-metadata` - Runtime type information
- `@filipgorny/logger` - Logging support

## Architecture Benefits

### Protocol-Agnostic Design

The separation between `Api` (abstract) and `RestApi` (concrete) allows:

1. **Multiple protocol implementations** - Add GraphQL, gRPC without changing core
2. **Consistent API** - Same patterns across different protocols
3. **Easy migration** - Switch protocols with minimal code changes
4. **Better testing** - Mock strategies for unit tests

### Example: Future GraphQL Implementation

```typescript
// Future possibility
class GraphQLApi extends Api {
  query<TInput, TOutput>(options, handler): this
  mutation<TInput, TOutput>(options, handler): this
  subscription<TInput, TOutput>(options, handler): this

  protected defaultMethods = [...] // GraphQL-specific defaults
}
```

## License

MIT
