import express, { Application } from "express";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { EndpointDefinition } from "./types";
import { ServiceApiEndpoint } from "./ServiceApiEndpoint";

// Creates an Express application from a service API definition
export function createHTTPServiceAPI(definition: {
  getEndpoints: () => EndpointDefinition<any>[];
}): {
  app: Application;
  documentation: ServiceApiEndpoint;
  run: (port: number) => void;
// Initialize Express app and enable JSON parsing middleware
} {
  const app = express();
// Get endpoints from definition and create documentation instance
  app.use(express.json());

// Register each endpoint as an Express route
// Async route handler for processing requests
  const endpoints = definition.getEndpoints();
  const documentation = new ServiceApiEndpoint(endpoints);

  endpoints.forEach((ep) => {
// Transform plain request data into an instance of the input class
    const routeHandler = async (
      req: express.Request,
      res: express.Response,
// Validate the input instance using class-validator
    ) => {
// Return 400 if validation fails
      try {
// Execute the endpoint handler with the validated input
// Respond with JSON if output class exists, otherwise 204 No Content
        const inputInstance = plainToClass(
          ep.inputClass,
          req.method === "GET" ? req.query : req.body,
        );
// Handle any errors by returning 500
        const errors = await validate(inputInstance);
        if (errors.length > 0) {
          return res.status(400).json({ errors });
        }
// Register the route handler based on the HTTP method
        const result = await ep.handler(inputInstance);
        if (ep.outputClass) {
          res.json(result);
        } else {
          res.status(204).send();
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    };

    switch (ep.method) {
      case "GET":
        app.get(ep.path, routeHandler);
        break;
// Add a /docs endpoint to serve API documentation
      case "POST":
        app.post(ep.path, routeHandler);
        break;
      case "PUT":
// Function to start the server on a specified port
        app.put(ep.path, routeHandler);
        break;
      case "DELETE":
        app.delete(ep.path, routeHandler);
        break;
    }
  });

  // Add documentation endpoint
  app.get("/docs", (req, res) => {
    res.json(documentation.getDocumentation());
  });

  const run = (port: number) => {
    app.listen(port, () => {
      console.log(`Service API running on port ${port}`);
    });
  };

  return { app, documentation, run };
}
