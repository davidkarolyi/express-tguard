import { validateSchema } from "./index";
import request from "supertest";
import express, { json, RequestHandler } from "express";
import { TArray, TNumber, TNumberAsString, TString } from "tguard";
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

        it("infers types correctly", async () => {
          const requestSchema = {
            body: { name: TString, posts: TArray(TString) },
            params: {
              id: TString,
            },
            query: {
              ids: TArray(TString),
            },
          };
          const app = express();
          app.post(
            "/:id",
            json(),
            validateSchema(requestSchema, (req, res) => {
              // These statements will throw a TS error, if they're not typed correctly
              req.body.posts.filter((post) => post.endsWith(""));
              req.query.ids.filter((id) => id.endsWith(""));
              req.params.id.split("").filter((char) => char.endsWith(""));
              res.sendStatus(StatusCodes.OK);
            })
          );

          await request(app)
            .post("/id123")
            .query({ ids: ["", ""] })
            .send({ name: "John", posts: [] })
            .expect(StatusCodes.OK);
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
