import "reflect-metadata";
import { SchemaView } from "../src/documentation/views/schema-view";
import { MethodDocumentation } from "../src/documentation/method-documentation";
import { TypesRegistry } from "../src/method/types-registry";
import { ApiManifest } from "../src/manifest/api-manifest";
import { MethodType } from "../src/method/method-type";

describe("SchemaView", () => {
  let schemaView: SchemaView;

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

  const mockMethods: MethodDocumentation[] = [
    new MethodDocumentation(
      "books",
      MethodType.GET,
      { name: "ListBooksInput", properties: ["limit", "offset"] },
      { name: "BooksListResult", properties: ["books", "total"] },
      "Get list of all books",
    ),
    new MethodDocumentation(
      "book/:id",
      MethodType.GET,
      { name: "GetBookInput", properties: ["id"] },
      { name: "Book", properties: ["id", "title", "author", "available"] },
      "Get single book by ID",
    ),
    new MethodDocumentation(
      "book",
      MethodType.CREATE,
      { name: "CreateBookInput", properties: ["title", "author"] },
      { name: "Book", properties: ["id", "title", "author", "available"] },
      "Create a new book",
    ),
    new MethodDocumentation(
      "book/:id",
      MethodType.UPDATE,
      { name: "UpdateBookInput", properties: ["id", "title", "author"] },
      { name: "Book", properties: ["id", "title", "author", "available"] },
      "Update existing book",
    ),
    new MethodDocumentation(
      "book/:id",
      MethodType.DELETE,
      { name: "DeleteBookInput", properties: ["id"] },
      undefined,
      "Delete a book",
    ),
  ];

  const mockTypes: TypesRegistry = {
    ListBooksInput: {
      properties: ["limit", "offset"],
    },
    BooksListResult: {
      properties: ["books", "total"],
    },
    GetBookInput: {
      properties: ["id"],
    },
    Book: {
      properties: ["id", "title", "author", "available"],
    },
    CreateBookInput: {
      properties: ["title", "author"],
    },
    UpdateBookInput: {
      properties: ["id", "title", "author"],
    },
    DeleteBookInput: {
      properties: ["id"],
    },
  };

  beforeEach(() => {
    schemaView = new SchemaView(
      "book-service",
      mockMethods,
      "1.0.0",
      mockTypes,
      "http://book-service:3000",
    );
  });

  describe("getManifest", () => {
    it("should generate valid API manifest", () => {
      const manifest = schemaView.getManifest();

      expect(manifest).toBeDefined();
      expect(manifest.service).toBeDefined();
      expect(manifest.operations).toBeDefined();
      expect(manifest.definitions).toBeDefined();
    });

    it("should include correct service information", () => {
      const manifest = schemaView.getManifest();

      expect(manifest.service.name).toBe("book-service");
      expect(manifest.service.version).toBe("1.0.0");
      expect(manifest.service.baseUrl).toBe("http://book-service:3000");
    });

    it("should generate operations for all methods", () => {
      const manifest = schemaView.getManifest();

      expect(manifest.operations).toHaveLength(5);
    });

    it("should map GET methods to query operations", () => {
      const manifest = schemaView.getManifest();

      const booksListOp = manifest.operations.find((op) => op.id === "books.list");
      expect(booksListOp).toBeDefined();
      expect(booksListOp?.operationType).toBe("query");
      expect(booksListOp?.description).toBe("Get list of all books");

      const bookGetOp = manifest.operations.find((op) => op.id === "book.get");
      expect(bookGetOp).toBeDefined();
      expect(bookGetOp?.operationType).toBe("query");
    });

    it("should map CREATE methods to mutation operations", () => {
      const manifest = schemaView.getManifest();

      const createOp = manifest.operations.find((op) => op.id === "book.create");
      expect(createOp).toBeDefined();
      expect(createOp?.operationType).toBe("mutation");
      expect(createOp?.description).toBe("Create a new book");
    });

    it("should map UPDATE methods to mutation operations", () => {
      const manifest = schemaView.getManifest();

      const updateOp = manifest.operations.find((op) => op.id === "book.update");
      expect(updateOp).toBeDefined();
      expect(updateOp?.operationType).toBe("mutation");
    });

    it("should map DELETE methods to mutation operations", () => {
      const manifest = schemaView.getManifest();

      const deleteOp = manifest.operations.find((op) => op.id === "book.delete");
      expect(deleteOp).toBeDefined();
      expect(deleteOp?.operationType).toBe("mutation");
    });

    it("should include input schemas with references", () => {
      const manifest = schemaView.getManifest();

      const createOp = manifest.operations.find((op) => op.id === "book.create");
      expect(createOp?.input.schema.$ref).toBe("#/definitions/CreateBookInput");
    });

    it("should include output schemas with references", () => {
      const manifest = schemaView.getManifest();

      const createOp = manifest.operations.find((op) => op.id === "book.create");
      expect(createOp?.output.schema.$ref).toBe("#/definitions/Book");
    });

    it("should handle void output for DELETE", () => {
      const manifest = schemaView.getManifest();

      const deleteOp = manifest.operations.find((op) => op.id === "book.delete");
      expect(deleteOp?.output.schema.type).toBe("void");
    });

    it("should generate definitions for all types", () => {
      const manifest = schemaView.getManifest();

      expect(manifest.definitions.Book).toBeDefined();
      expect(manifest.definitions.CreateBookInput).toBeDefined();
      expect(manifest.definitions.ListBooksInput).toBeDefined();
      expect(manifest.definitions.BooksListResult).toBeDefined();
    });

    it("should include properties in definitions", () => {
      const manifest = schemaView.getManifest();

      const bookDef = manifest.definitions.Book;
      expect(bookDef.properties).toBeDefined();
      expect(Object.keys(bookDef.properties!)).toEqual([
        "id",
        "title",
        "author",
        "available",
      ]);
    });

    it("should generate valid JSON structure", () => {
      const manifest = schemaView.getManifest();

      // Should be serializable to JSON without errors
      expect(() => JSON.stringify(manifest)).not.toThrow();

      const json = JSON.stringify(manifest, null, 2);
      expect(json).toContain("book-service");
      expect(json).toContain("1.0.0");
      expect(json).toContain("books.list");
    });
  });

  describe("getHTML", () => {
    it("should return valid HTML", () => {
      const html = schemaView.getHTML();

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("<html>");
      expect(html).toContain("</html>");
    });

    it("should include API name in HTML", () => {
      const html = schemaView.getHTML();

      expect(html).toContain("book-service");
    });

    it("should include manifest JSON in HTML", () => {
      const html = schemaView.getHTML();

      expect(html).toContain("operations");
      expect(html).toContain("definitions");
      expect(html).toContain("books.list");
    });
  });

  describe("Edge cases", () => {
    it("should handle empty methods array", () => {
      const emptyView = new SchemaView(
        "empty-service",
        [],
        "1.0.0",
        {},
        "http://localhost:3000",
      );

      const manifest = emptyView.getManifest();
      expect(manifest.operations).toEqual([]);
      expect(manifest.definitions).toEqual({});
    });

    it("should handle missing baseUrl", () => {
      const noUrlView = new SchemaView(
        "no-url-service",
        [],
        "1.0.0",
        {},
      );

      const manifest = noUrlView.getManifest();
      expect(manifest.service.baseUrl).toBe("");
    });

    it("should handle methods without descriptions", () => {
      const methodWithoutDesc: MethodDocumentation[] = [
        new MethodDocumentation("test", MethodType.GET, undefined, undefined, undefined),
      ];

      const view = new SchemaView(
        "test-service",
        methodWithoutDesc,
        "1.0.0",
        {},
      );

      const manifest = view.getManifest();
      const op = manifest.operations[0];
      expect(op.description).toBeUndefined();
    });
  });
});
