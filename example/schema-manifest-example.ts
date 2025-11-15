import "reflect-metadata";
import { RestApi, express, SchemaView } from "../src";

/**
 * Example: Using Universal API Manifest
 *
 * This example demonstrates how to generate a protocol-agnostic API manifest
 * that can be consumed by API Gateway to create proxy methods.
 */

// Example DTOs
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

// Create REST API
const api = new RestApi(express(3001));

// Define endpoints
api.get("books", async () => {
  return { books: [] };
});

api.get("book/:id", async (input: { id: number }) => {
  return { id: input.id, title: "Example Book", author: "Example Author", available: true };
});

api.create("book", async (input: CreateBookInput) => {
  return { id: 1, ...input, available: true };
});

api.update("book/:id", async (input: Partial<Book> & { id: number }) => {
  return { id: input.id, title: "Updated", author: "Updated Author", available: true };
});

api.delete("book/:id", async (input: { id: number }) => {
  // Delete logic
});

// Start the server
api.run();

console.log("🔧 Universal API Manifest Example");
console.log("\n📋 The /schema endpoint returns a manifest like this:\n");

// Simulate what the /schema endpoint returns
setTimeout(() => {
  fetch("http://localhost:3001/schema")
    .then((res) => res.json())
    .then((manifest) => {
      console.log(JSON.stringify(manifest, null, 2));
      console.log("\n✨ This manifest includes:");
      console.log("  • service: Service metadata (name, version, baseUrl)");
      console.log("  • operations: All API operations with their types");
      console.log("    - query (GET) → Read operations");
      console.log("    - mutation (CREATE/UPDATE/DELETE) → Write operations");
      console.log("    - subscription → Event streams (future)");
      console.log("  • definitions: Type schemas for input/output");
      console.log("\n🌐 How API Gateway uses this:");
      console.log("  1. Fetches manifest from: GET /schema");
      console.log("  2. For each operation, creates a proxy method");
      console.log("  3. Maps to target protocol:");
      console.log("     REST:     query→GET, mutation→POST/PUT/DELETE");
      console.log("     GraphQL:  query→Query, mutation→Mutation");
      console.log("     Kafka:    query→request/response, mutation→event");
      console.log("\n💡 Example: 'books.list' operation can become:");
      console.log("  • REST:     GET /api/book-service/books/list");
      console.log("  • GraphQL:  query { booksList { books { id title } } }");
      console.log("  • Kafka:    produce to 'books.list.request' topic");

      process.exit(0);
    })
    .catch((err) => {
      console.error("Error fetching manifest:", err.message);
      console.log("\nMake sure the server is running!");
      process.exit(1);
    });
}, 1000);
