import { validateSchema } from "./index";
import request from "supertest";
import express, { json, RequestHandler } from "express";
import { TNumber, TNumberAsString, TString } from "tguard";
import { StatusCodes } from "http-status-codes";

describe("validateSchema", () => {
  it("returns a request handler", () => {
    expect(typeof validateSchema({})).toBe("function");
  });

  describe("the returned request handler", () => {
    describe("when the request does not match the schema", () => {
      describe("when body is invalid", () => {
        it("reponds with a descriptive error message and status 400", async () => {
          const app = express();
          app.post(
            "/",
            json(),
            validateSchema({ body: { id: TNumber, name: TString } })
          );
          const response = await request(app)
            .post("/")
            .send({ id: 10 })
            .expect(StatusCodes.BAD_REQUEST);

          expect(response.body).toEqual({
            error:
              'Validation failed: Missing value at "body.name", expected type: string',
          });
        });
      });

      describe("when params are invalid", () => {
        it("responds with a descriptive error message and status 400", async () => {
          const app = express();
          app.post("/:id", validateSchema({ params: { id: TNumberAsString } }));
          const response = await request(app)
            .post("/foo")
            .expect(StatusCodes.BAD_REQUEST);

          expect(response.body).toEqual({
            error:
              'Validation failed: Invalid value at "params.id", expected type: number(as a string)',
          });
        });
      });

      describe("when query is invalid", () => {
        it("responds with a descriptive error message and status 400", async () => {
          const app = express();
          app.post("/", validateSchema({ query: { id: TNumberAsString } }));
          const response = await request(app)
            .post("/")
            .query({ id: "foo" })
            .expect(StatusCodes.BAD_REQUEST);

          expect(response.body).toEqual({
            error:
              'Validation failed: Invalid value at "query.id", expected type: number(as a string)',
          });
        });
      });
    });

    describe("when the request matches the schema", () => {
      const mockHandler: RequestHandler = (_, res) =>
        res.sendStatus(StatusCodes.OK);

      const requestSchema = { body: { name: TString, age: TNumber } };
      const validBody = {
        name: "John",
        age: 20,
      };

      describe("when a request handler was provided", () => {
        it("calls the provided request handler", async () => {
          const app = express();
          const handler = jest.fn().mockImplementation(mockHandler);
          app.post("/", json(), validateSchema(requestSchema, handler));

          await request(app).post("/").send(validBody).expect(StatusCodes.OK);

          expect(handler).toHaveBeenCalled();
        });
      });

      describe("when a handler wasn't provided", () => {
        it("calls next() function", async () => {
          const app = express();
          const handler = jest.fn().mockImplementation(mockHandler);
          app.post("/", json(), validateSchema(requestSchema), handler);

          await request(app).post("/").send(validBody).expect(StatusCodes.OK);

          expect(handler).toHaveBeenCalled();
        });
      });
    });
  });
});
