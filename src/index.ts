import { RequestHandler, json, request } from "express";
import { StatusCodes } from "http-status-codes";
import { Guard, Schema, TAny } from "tguard";

export interface RequestSchema {
  params?: Schema;
  body?: Schema;
  query?: Schema;
}

export function validateSchema(
  requestSchema: RequestSchema,
  handler?: RequestHandler
): RequestHandler {
  const TRequest = new Guard(normalizeSchema(requestSchema));

  return (req, res, next) => {
    try {
      TRequest.cast(req);
      if (handler) handler(req, res, next);
      else next();
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  };
}

function normalizeSchema(requestSchema: RequestSchema) {
  return Object.entries(requestSchema).reduce<Schema>(
    (schema, [key, value]) => ({ ...schema, [key]: value }),
    {}
  );
}
