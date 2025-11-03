# Library Management Microservice Example

This example demonstrates a CRUD microservice for managing a library with books and rentals using the @filipgorny/service-api library.

## Features

- CRUD operations for books
- Rent and return books
- Mock in-memory database
- Automatic API documentation

## Running the Example

1. Build the package:

   ```bash
   cd packages/service-api
   npm run build
   ```

2. Run the example:

   ```bash
   npx ts-node example/index.ts
   ```

3. The service will start on port 3000.

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

## Documentation

Visit `http://localhost:3000/docs` for JSON API documentation.

Alternatively, view the generated documentation: [docs.json](./docs.json)
