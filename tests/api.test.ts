import "reflect-metadata";
import request from "supertest";
import { RestApi, express as expressStrategy } from "../src";

class TestInput {
  name: string;
}

describe("Service API", () => {
  let app: any;
  let api: RestApi;

  beforeAll(async () => {
    api = new RestApi(expressStrategy(0), false);

    api.create("create", async function (input: TestInput) {
      return { message: `Hello ${input.name}` };
    });

    api.get("/api", async () => {
      return "<!DOCTYPE html><html><body><h1>API Documentation</h1></body></html>";
    });

    api.get("health", async () => {
      return {
        status: "healthy",
        version: api.getVersion(),
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    });

    // Configure the strategy
    (api as any).strategy.configure(api.getMethods(), api.getVersion());

    app = (api as any).strategy.app;
  });

  afterAll(async () => {
    await api.shutdown();
  });

  it("should create a resource", async () => {
    const response = await request(app)
      .post("/create")
      .send({ name: "World" })
      .expect(200);

    expect(response.body).toEqual({ message: "Hello World" });
  });

  it("should return 200 for /api endpoint", async () => {
    const response = await request(app)
      .get("/api")
      .expect(200)
      .expect("Content-Type", /text\/html/);

    expect(
      typeof response.text === "string" &&
        response.text.includes("<!DOCTYPE html>"),
    ).toBe(true);
    expect(response.text).toContain("API Documentation");
  });

  it("should return 200 for /health endpoint", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toHaveProperty("status", "healthy");
  });
});
