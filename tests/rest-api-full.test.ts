import "reflect-metadata";
import request from "supertest";
import { RestApi, express as expressStrategy } from "../src";

// DTOs matching the example
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

describe("REST API - Full Example Test", () => {
  let app: any;
  let books: Book[];
  let nextBookId: number;

  beforeAll(async () => {
    // Initialize mock database
    books = [
      new Book(1, "1984", "George Orwell", true),
      new Book(2, "To Kill a Mockingbird", "Harper Lee", true),
    ];
    nextBookId = 3;

    // Create REST API instance
    const api = new RestApi(expressStrategy(0), false);

    // GET /books - Get all books
    api.get("books", async function () {
      return { books };
    });

    // GET /book/:id - Get book by ID
    api.get("book/:id", async function (input: { id: number }) {
      const book = books.find((b) => b.id === input.id);
      if (!book) throw new Error("Book not found");
      return book;
    });

    // POST /book - Create a new book
    api.create("book", async function (input: CreateBookInput) {
      const book = new Book(nextBookId++, input.title, input.author);
      books.push(book);
      return book;
    });

    // PUT /book/:id - Update a book
    api.update(
      "book/:id",
      async function (input: Partial<Book> & { id: number }) {
        const book = books.find((b) => b.id === input.id);
        if (!book) throw new Error("Book not found");
        if (input.title !== undefined) book.title = input.title;
        if (input.author !== undefined) book.author = input.author;
        if (input.available !== undefined) book.available = input.available;
        return book;
      },
    );

    // DELETE /book/:id - Delete a book
    api.delete("book/:id", async function (input: { id: number }) {
      const index = books.findIndex((b) => b.id === input.id);
      if (index === -1) throw new Error("Book not found");
      books.splice(index, 1);
    });

    // Configure the strategy
    (api as any).strategy.configure(api.getMethods(), api.getVersion());
    app = (api as any).strategy.app;
  });

  describe("GET /books - Get all books", () => {
    it("should return all books", async () => {
      const response = await request(app).get("/books").expect(200);

      expect(response.body).toHaveProperty("books");
      expect(response.body.books).toBeInstanceOf(Array);
      expect(response.body.books.length).toBeGreaterThanOrEqual(2);
      expect(response.body.books[0]).toMatchObject({
        id: 1,
        title: "1984",
        author: "George Orwell",
        available: true,
      });
    });
  });

  describe("GET /book/:id - Get book by ID", () => {
    it("should return a specific book by id", async () => {
      const response = await request(app).get("/book/1").expect(200);

      expect(response.body).toMatchObject({
        id: 1,
        title: "1984",
        author: "George Orwell",
        available: true,
      });
    });

    it("should return 500 when book not found", async () => {
      const response = await request(app).get("/book/999").expect(500);

      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toContain("Book not found");
    });
  });

  describe("POST /book - Create a new book", () => {
    it("should create a new book", async () => {
      const newBook = {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
      };

      const response = await request(app)
        .post("/book")
        .send(newBook)
        .expect(200);

      expect(response.body).toMatchObject({
        id: 3,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        available: true,
      });

      // Verify it was added
      const allBooksResponse = await request(app).get("/books").expect(200);
      expect(allBooksResponse.body.books.length).toBe(3);
    });
  });

  describe("PUT /book/:id - Update a book", () => {
    it("should update an existing book", async () => {
      const updates = {
        id: 1,
        title: "1984 (Updated)",
        available: false,
      };

      const response = await request(app)
        .put("/book/1")
        .send(updates)
        .expect(200);

      expect(response.body).toMatchObject({
        id: 1,
        title: "1984 (Updated)",
        author: "George Orwell",
        available: false,
      });
    });

    it("should return 500 when updating non-existent book", async () => {
      const updates = {
        id: 999,
        title: "Non-existent",
      };

      const response = await request(app)
        .put("/book/999")
        .send(updates)
        .expect(500);

      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toContain("Book not found");
    });
  });

  describe("DELETE /book/:id - Delete a book", () => {
    it("should delete a book", async () => {
      // First verify book exists
      await request(app).get("/book/2").expect(200);

      // Delete the book
      await request(app).delete("/book/2").expect(200);

      // Verify it's gone
      const response = await request(app).get("/book/2").expect(500);
      expect(response.body.message).toContain("Book not found");

      // Verify total count decreased
      const allBooksResponse = await request(app).get("/books").expect(200);
      expect(allBooksResponse.body.books.length).toBe(2); // Started with 3 after create, now 2
    });

    it("should return 500 when deleting non-existent book", async () => {
      const response = await request(app).delete("/book/999").expect(500);

      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toContain("Book not found");
    });
  });

  describe("Full workflow test", () => {
    it("should handle complete CRUD workflow", async () => {
      // 1. Get initial books count
      const initial = await request(app).get("/books").expect(200);
      const initialCount = initial.body.books.length;

      // 2. Create a new book
      const createResponse = await request(app)
        .post("/book")
        .send({
          title: "Brave New World",
          author: "Aldous Huxley",
        })
        .expect(200);

      const newBookId = createResponse.body.id;
      expect(createResponse.body.title).toBe("Brave New World");

      // 3. Verify it was created
      const afterCreate = await request(app).get("/books").expect(200);
      expect(afterCreate.body.books.length).toBe(initialCount + 1);

      // 4. Get the specific book
      const getResponse = await request(app)
        .get(`/book/${newBookId}`)
        .expect(200);
      expect(getResponse.body.author).toBe("Aldous Huxley");

      // 5. Update the book
      const updateResponse = await request(app)
        .put(`/book/${newBookId}`)
        .send({
          id: newBookId,
          available: false,
        })
        .expect(200);
      expect(updateResponse.body.available).toBe(false);

      // 6. Delete the book
      await request(app).delete(`/book/${newBookId}`).expect(200);

      // 7. Verify it was deleted
      const afterDelete = await request(app).get("/books").expect(200);
      expect(afterDelete.body.books.length).toBe(initialCount);

      // 8. Verify we can't get the deleted book
      await request(app).get(`/book/${newBookId}`).expect(500);
    });
  });
});
