import "reflect-metadata";
import request from "supertest";
import { RestApi, express as expressStrategy } from "../src";

class Book {
  id: number;
  title: string;
  author: string;
  available: boolean;
}

class CreateBookInput {
  title: string;
  author: string;
}

describe("Schema Endpoint", () => {
  let app: any;
  let api: RestApi;

  beforeAll(async () => {
    api = new RestApi(expressStrategy(0));

    // Add some test endpoints
    api.get("books", async () => {
      return { books: [] };
    });

    api.get("book/:id", async (input: { id: number }) => {
      return { id: input.id, title: "Test Book", author: "Test Author", available: true };
    });

    api.create("book", async (input: CreateBookInput) => {
      return { id: 1, ...input, available: true };
    });

    api.update("book/:id", async (input: Partial<Book> & { id: number }) => {
      return { id: input.id, title: "Updated", author: "Updated Author", available: true };
    });

    api.delete("book/:id", async (input: { id: number }) => {
      // Delete book
    });

    // Run the API to register default methods (including /schema)
    api.run();

    app = (api as any).strategy.app;
  });

  it("should return 200 for /schema endpoint", async () => {
    const response = await request(app)
      .get("/schema")
      .expect(200)
      .expect("Content-Type", /json/);

    expect(response.body).toBeDefined();
  });

  it("should return valid API manifest structure", async () => {
    const response = await request(app).get("/schema").expect(200);

    const manifest = response.body;

    expect(manifest).toHaveProperty("service");
    expect(manifest).toHaveProperty("operations");
    expect(manifest).toHaveProperty("definitions");
  });

  it("should include service information", async () => {
    const response = await request(app).get("/schema").expect(200);

    const manifest = response.body;

    expect(manifest.service).toHaveProperty("name");
    expect(manifest.service).toHaveProperty("version");
    expect(manifest.service).toHaveProperty("baseUrl");
  });

  it("should include all registered operations", async () => {
    const response = await request(app).get("/schema").expect(200);

    const manifest = response.body;

    expect(Array.isArray(manifest.operations)).toBe(true);

    // Should have: Documentation, schema, health, books, book/:id (get), book (create), book/:id (update), book/:id (delete)
    expect(manifest.operations.length).toBeGreaterThan(5);
  });

  it("should map GET operations to query type", async () => {
    const response = await request(app).get("/schema").expect(200);

    const manifest = response.body;

    const booksOp = manifest.operations.find((op: any) => op.id === "books.list");
    expect(booksOp).toBeDefined();
    expect(booksOp.operationType).toBe("query");
  });

  it("should map CREATE operations to mutation type", async () => {
    const response = await request(app).get("/schema").expect(200);

    const manifest = response.body;

    const createOp = manifest.operations.find((op: any) => op.id === "book.create");
    expect(createOp).toBeDefined();
    expect(createOp.operationType).toBe("mutation");
  });

  it("should map UPDATE operations to mutation type", async () => {
    const response = await request(app).get("/schema").expect(200);

    const manifest = response.body;

    const updateOp = manifest.operations.find((op: any) => op.id === "book.update");
    expect(updateOp).toBeDefined();
    expect(updateOp.operationType).toBe("mutation");
  });

  it("should map DELETE operations to mutation type", async () => {
    const response = await request(app).get("/schema").expect(200);

    const manifest = response.body;

    const deleteOp = manifest.operations.find((op: any) => op.id === "book.delete");
    expect(deleteOp).toBeDefined();
    expect(deleteOp.operationType).toBe("mutation");
  });

  it("should include operation descriptions", async () => {
    const response = await request(app).get("/schema").expect(200);

    const manifest = response.body;

    const healthOp = manifest.operations.find((op: any) => op.id === "health.get");
    expect(healthOp).toBeDefined();
    expect(healthOp.description).toBe("Health check");
  });

  it("should include input and output schemas", async () => {
    const response = await request(app).get("/schema").expect(200);

    const manifest = response.body;

    const createOp = manifest.operations.find((op: any) => op.id === "book.create");
    expect(createOp).toBeDefined();
    expect(createOp.input).toBeDefined();
    expect(createOp.input.schema).toBeDefined();
    expect(createOp.output).toBeDefined();
    expect(createOp.output.schema).toBeDefined();
  });

  it("should be valid JSON", async () => {
    const response = await request(app).get("/schema").expect(200);

    // Should be parseable JSON
    expect(() => JSON.parse(JSON.stringify(response.body))).not.toThrow();
  });

  it("should include schema endpoint itself in operations", async () => {
    const response = await request(app).get("/schema").expect(200);

    const manifest = response.body;

    const schemaOp = manifest.operations.find((op: any) => op.id === "schema.get");
    expect(schemaOp).toBeDefined();
    expect(schemaOp.operationType).toBe("query");
    expect(schemaOp.description).toBe("Universal API schema manifest");
  });
});
