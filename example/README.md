# Service API Examples

This folder contains examples demonstrating the @filipgorny/service-api library features.

## Examples

### 1. REST API Example (`rest-api-example.ts`)

A simple book management service showcasing REST endpoints.

**Features:**
- CRUD operations for books
- Mock in-memory database
- Automatic health check, documentation, and schema endpoints

**Run:**
```bash
npx ts-node example/rest-api-example.ts
```

Server starts on port 3000.

### 2. Universal API Manifest Example (`schema-manifest-example.ts`)

Demonstrates the protocol-agnostic API manifest format.

**Features:**
- Shows how `/schema` endpoint works
- Explains manifest structure
- Shows how API Gateway can consume it

**Run:**
```bash
npx ts-node example/schema-manifest-example.ts
```

Server starts on port 3001.

### 3. Original Library Example (`index.ts`)

Original complete example with books and rentals management.

**Run:**
```bash
npx ts-node example/index.ts
```

## API Endpoints

### Books

- `POST /action` - Create a book
  - Input: `{ title: string, author: string }`
  - Output: Book

- `GET /query` - Get all books
  - Input: `{}`
  - Output: `{ books: Book[] }`

- `GET /query` - Get book by ID
  - Input: `{ id: number }`
  - Output: Book

- `POST /action` - Update book
  - Input: `{ id: number, title?: string, author?: string, available?: boolean }`
  - Output: Book

- `DELETE /deletion` - Delete book
  - Input: `{ id: number }`

### Rentals

- `POST /action` - Rent a book
  - Input: `{ bookId: number, renterName: string }`
  - Output: Rental

- `GET /query` - Get all rentals
  - Input: `{}`
  - Output: `{ rentals: Rental[] }`

- `POST /action` - Return a book
  - Input: `{ rentalId: number }`
  - Output: Rental

## Default Endpoints

Every REST API includes these endpoints automatically:

- **`GET /health`** - Health check with version and uptime
- **`GET /Documentation`** - Interactive OpenAPI/Swagger documentation
- **`GET /schema`** - Universal API manifest (NEW!)

### Universal API Manifest (`/schema`)

The `/schema` endpoint returns a protocol-agnostic API description that can be used by API Gateway to automatically create proxy methods for different protocols.

**Example manifest structure:**
```json
{
  "service": {
    "name": "book-service",
    "version": "1.0.0",
    "baseUrl": ""
  },
  "operations": [
    {
      "id": "books.list",
      "operationType": "query",
      "description": "Get all books",
      "input": { "schema": { ... } },
      "output": { "schema": { ... } }
    }
  ],
  "definitions": { ... }
}
```

**Operation types:**
- `query` - Read operations (GET)
- `mutation` - Write operations (CREATE/UPDATE/DELETE)
- `subscription` - Event streams (future)

**Use cases:**
- API Gateway can fetch this manifest and create proxy methods
- Same manifest works for REST, GraphQL, and Kafka
- Enables protocol-agnostic microservice communication

## API Endpoints (Original Example)
