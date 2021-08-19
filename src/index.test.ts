import { SchemaGuard } from "./index";
import request from "supertest";
import express, { RequestHandler } from "express";
import { GuardDefinitionObject, TNumber, TString } from "tguard";

describe("SchemaGuard", () => {
  it("can be instantiated", () => {
    const schemaGuard = new SchemaGuard();
    expect(schemaGuard).toBeInstanceOf(SchemaGuard);
  });

  describe("require", () => {
    const schemaGuard = new SchemaGuard();

    it("accepts a guard definiton object as a first parameter", () => {
      const definition: GuardDefinitionObject = {};
      expect(() => schemaGuard.require(definition)).not.toThrow();
    });

    it("accepts an optional request handler", () => {
      const definition: GuardDefinitionObject = {};
      const handler: RequestHandler = () => {};
      expect(() => schemaGuard.require(definition, handler)).not.toThrow();
    });

    it("returns a request handler", () => {
      const definition: GuardDefinitionObject = {};
      expect(typeof schemaGuard.require(definition)).toBe("function");
    });

    describe("the returned request handler", () => {
      const definition: GuardDefinitionObject = {
        body: {
          name: TString,
          age: TNumber,
        },
      };

      describe("when the request does not matching the schema", () => {
        it("reponds with 400 Bad request", async () => {
          const app = express();
          app.get("/", schemaGuard.require(definition));
          await request(app).get("/").expect(400);
        });
      });

      describe("when the request is matching the schema", () => {
        it("calls the provided request handler", async () => {
          const handler = jest
            .fn()
            .mockImplementation((req, res) => res.sendStatus(200));
          const app = express();
          app.get("/", schemaGuard.require(definition, handler));
          await request(app).get("/").expect(200);
          expect(handler).toHaveBeenCalled();
        });
      });
    });
  });
});
