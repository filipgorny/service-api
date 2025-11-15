import "reflect-metadata";
import { RestApi, express } from "../src";

// Example DTO
class CreateBookInput {
  title: string;
  author: string;
}

class Book {
  id: number;
  title: string;
  author: string;
  available: boolean;

  constructor(id: number, title: string, author: string, available = true) {
    this.id = id;
    this.title = title;
    this.author = author;
    this.available = available;
  }
}

// Mock database
const books: Book[] = [
  new Book(1, "1984", "George Orwell", true),
  new Book(2, "To Kill a Mockingbird", "Harper Lee", true),
];

let nextBookId = 3;

// Create REST API instance with Express strategy
const api = new RestApi(express(3000));

// Define REST endpoints using convenience methods

// GET /books - Get all books
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
  const book = new Book(nextBookId++, input.title, input.author);
  books.push(book);
  return book;
});

// PUT /book/:id - Update a book
api.update("book/:id", async (input: Partial<Book> & { id: number }) => {
  const book = books.find((b) => b.id === input.id);
  if (!book) throw new Error("Book not found");
  if (input.title !== undefined) book.title = input.title;
  if (input.author !== undefined) book.author = input.author;
  if (input.available !== undefined) book.available = input.available;
  return book;
});

// DELETE /book/:id - Delete a book
api.delete("book/:id", async (input: { id: number }) => {
  const index = books.findIndex((b) => b.id === input.id);
  if (index === -1) throw new Error("Book not found");
  books.splice(index, 1);
});

// Start the server
console.log("📚 REST API Example - Book Management Service");
console.log("\nCustom Endpoints:");
console.log("  GET    /books        - Get all books");
console.log("  GET    /book/:id     - Get book by ID");
console.log("  POST   /book         - Create a new book");
console.log("  PUT    /book/:id     - Update a book");
console.log("  DELETE /book/:id     - Delete a book");
console.log("\nDefault Endpoints:");
console.log("  GET    /health       - Health check");
console.log("  GET    /Documentation - OpenAPI/Swagger documentation");
console.log("  GET    /schema       - Universal API manifest (protocol-agnostic)");
console.log("\n🚀 Server starting on http://localhost:3000");
console.log("\n💡 Try:");
console.log("  curl http://localhost:3000/schema");
console.log("  This returns a universal API manifest that can be used by API Gateway");
console.log("  to automatically create proxy methods for REST, GraphQL, or Kafka!");

api.run();
