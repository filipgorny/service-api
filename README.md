# @filipgorny/service-api

A TypeScript library for defining and creating HTTP service APIs with automatic validation and documentation generation.

## Features

- Define API endpoints using class-based DTOs
- Automatic validation using class-validator decorators
- Generate Express.js routes from definitions
- Built-in JSON documentation endpoint
- Built-in descriptions for endpoint types

## Installation

```bash
pnpm add @filipgorny/service-api
```

## Usage

### Define DTOs

```typescript
import { IsString, IsNumber } from "class-validator";

class CreateUserInput {
  @IsString()
  name: string;

  @IsNumber()
  age: number;
}

class UserOutput {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsNumber()
  age: number;
}

class GetUserInput {
  @IsNumber()
  id: number;
}

class DeleteUserInput {
  @IsNumber()
  id: number;
}
```

### Create API Definition

```typescript
import { ServiceApiDefinition } from "@filipgorny/service-api";

const apiDefinition = new ServiceApiDefinition();

apiDefinition.defineAction(CreateUserInput, UserOutput, async (input) => {
  // Your business logic here
  return {
    id: 1,
    name: input.name,
    age: input.age,
  };
});

apiDefinition.defineQuery(GetUserInput, UserOutput, async (input) => {
  // Query logic
  return { id: input.id, name: "John", age: 30 };
});

apiDefinition.defineDeletion(DeleteUserInput, async (input) => {
  // Deletion logic, no output
  // e.g., delete user by id
});
```

### Create and Run HTTP Service

```typescript
import { createHTTPServiceAPI } from "@filipgorny/service-api";

const { app, run } = createHTTPServiceAPI(apiDefinition);

// Start the server
run(3000);

// Access documentation at http://localhost:3000/docs
```

## API Methods

- `defineAction<T, O>`: Creates a POST endpoint for actions (Define an action endpoint)
- `defineInput<T, O>`: Creates a POST endpoint for inputs (Define an input endpoint)
- `defineQuery<T, O>`: Creates a GET endpoint for queries (Define a query endpoint)
- `defineDeletion<T>`: Creates a DELETE endpoint for deletions (Define a deletion endpoint) - output is optional

## Documentation

The library automatically generates a `/docs` endpoint that returns JSON documentation of all endpoints and their types.

## Dependencies

- express
- class-validator
- class-transformer
- reflect-metadata

Make sure to enable experimental decorators and emit decorator metadata in your TypeScript configuration:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```
