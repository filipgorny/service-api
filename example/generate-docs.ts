import "reflect-metadata";
import { ServiceApiDefinition } from "../src";
import { ServiceApiEndpoint } from "../src";
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
import * as fs from "fs";

// Mock database (not needed for docs)
const books: Book[] = [];
const rentals: Rental[] = [];

// API Definition (same as index.ts)
const api = new ServiceApiDefinition();

// CRUD for Books
api.defineAction(CreateBookInput, Book, async (input) => new Book(0, "", ""));
api.defineQuery(EmptyInput, BookList, async () => ({ books }));
api.defineQuery(GetBookInput, Book, async (input) => new Book(0, "", ""));
api.defineAction(UpdateBookInput, Book, async (input) => new Book(0, "", ""));
api.defineDeletion(GetBookInput, async (input) => {});

// CRUD for Rentals
api.defineAction(
  RentBookInput,
  Rental,
  async (input) => new Rental(0, 0, "", ""),
);
api.defineQuery(EmptyInput, RentalList, async () => ({ rentals }));
api.defineAction(
  ReturnBookInput,
  Rental,
  async (input) => new Rental(0, 0, "", ""),
);

// Generate documentation
const endpoints = api.getEndpoints();
const documentation = new ServiceApiEndpoint(endpoints);

// Write to file
const docsJson = JSON.stringify(documentation.getDocumentation(), null, 2);
fs.writeFileSync("example/docs.json", docsJson);

console.log(
  "Documentation generated at packages/service-api/example/docs.json",
);
