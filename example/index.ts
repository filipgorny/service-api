import "reflect-metadata";
import { ServiceApiDefinition } from "../src";
import { createHTTPServiceAPI } from "../src";
import {
  Book,
  CreateBookInput,
  UpdateBookInput,
  GetBookInput,
  Rental,
  RentBookInput,
  ReturnBookInput,
  BookList,
  RentalList,
  EmptyInput,
} from "./dtos";

// Mock database
const books: Book[] = [
  new Book(1, "1984", "George Orwell", true),
  new Book(2, "To Kill a Mockingbird", "Harper Lee", true),
];

const rentals: Rental[] = [];

let nextBookId = 3;
let nextRentalId = 1;

// API Definition
const api = new ServiceApiDefinition();

// CRUD for Books

// Create Book
api.defineAction(CreateBookInput, Book, async (input) => {
  const book = new Book(nextBookId++, input.title, input.author);
  books.push(book);
  return book;
});

// Get All Books
api.defineQuery(EmptyInput, BookList, async () => {
  return { books };
});

// Get Book by ID
api.defineQuery(GetBookInput, Book, async (input) => {
  const book = books.find((b) => b.id === input.id);
  if (!book) throw new Error("Book not found");
  return book;
});

// Update Book
api.defineAction(UpdateBookInput, Book, async (input) => {
  const book = books.find((b) => b.id === input.id);
  if (!book) throw new Error("Book not found");
  if (input.title !== undefined) book.title = input.title;
  if (input.author !== undefined) book.author = input.author;
  if (input.available !== undefined) book.available = input.available;
  return book;
});

// Delete Book
api.defineDeletion(GetBookInput, async (input) => {
  const index = books.findIndex((b) => b.id === input.id);
  if (index === -1) throw new Error("Book not found");
  books.splice(index, 1);
});

// CRUD for Rentals

// Rent Book
api.defineAction(RentBookInput, Rental, async (input) => {
  const book = books.find((b) => b.id === input.bookId);
  if (!book) throw new Error("Book not found");
  if (!book.available) throw new Error("Book not available");
  book.available = false;
  const rental = new Rental(
    nextRentalId++,
    input.bookId,
    input.renterName,
    new Date().toISOString(),
  );
  rentals.push(rental);
  return rental;
});

// Get All Rentals
api.defineQuery(EmptyInput, RentalList, async () => {
  return { rentals };
});

// Return Book
api.defineAction(ReturnBookInput, Rental, async (input) => {
  const rental = rentals.find((r) => r.id === input.rentalId);
  if (!rental) throw new Error("Rental not found");
  if (rental.returnDate) throw new Error("Book already returned");
  rental.returnDate = new Date().toISOString();
  const book = books.find((b) => b.id === rental.bookId);
  if (book) book.available = true;
  return rental;
});

// Create and run the service
const { app, run } = createHTTPServiceAPI(api);

console.log("Library Management Microservice");
console.log("Endpoints:");
console.log("POST /action - Create Book");
console.log("GET /query - Get All Books or Get Book by ID");
console.log("POST /action - Update Book");
console.log("DELETE /deletion - Delete Book");
console.log("POST /action - Rent Book");
console.log("GET /query - Get All Rentals");
console.log("POST /action - Return Book");
console.log("GET /docs - API Documentation");

run(3000);
