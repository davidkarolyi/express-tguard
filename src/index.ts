import { RequestHandler } from "express";
import { GuardDefinition, GuardDefinitionObject } from "tguard";

export class SchemaGuard {
  require(
    definition: GuardDefinitionObject,
    handler?: RequestHandler
  ): RequestHandler {
    return (req, res) => {
      res.sendStatus(400);
    };
  }
}
