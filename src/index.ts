import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { Guard, Schema, SchemaType } from "tguard";

export type RequestSchema<BodySchema extends Schema = any> = {
  params?: Schema;
  body?: BodySchema;
  query?: Schema;
};

export function validateSchema<BodySchema extends Schema = any>(
  requestSchema: RequestSchema<BodySchema>,
  handler?: RequestHandler<any, any, SchemaType<BodySchema>>
): RequestHandler {
  const TRequest = new Guard(requestSchema);

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
