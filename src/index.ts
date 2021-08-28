import { RequestHandler, Request } from "express";
import { StatusCodes } from "http-status-codes";
import { Guard, Schema, SchemaType } from "tguard";

export type RequestSchema<
  ParamsSchema extends Schema = any,
  BodySchema extends Schema = any,
  QuerySchema extends Schema = any
> = {
  params?: ParamsSchema;
  body?: BodySchema;
  query?: QuerySchema;
};

export function validateSchema<
  ParamsSchema extends Schema<string> = any,
  BodySchema extends Schema = any,
  QuerySchema extends Schema = any
>(
  requestSchema: RequestSchema<ParamsSchema, BodySchema, QuerySchema>,
  handler?: RequestHandler<
    SchemaType<ParamsSchema>,
    any,
    SchemaType<BodySchema>,
    SchemaType<QuerySchema>
  >
): RequestHandler {
  const TRequest = new Guard(requestSchema);

  return (req, res, next) => {
    try {
      TRequest.cast(req);
      if (handler)
        handler(
          req as Request<
            SchemaType<ParamsSchema>,
            any,
            SchemaType<BodySchema>,
            SchemaType<QuerySchema>,
            Record<string, any>
          >,
          res,
          next
        );
      else next();
    } catch (error) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
    }
  };
}
