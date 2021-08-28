# express-tguard 💂‍♀️

> Minimalistic request validation middleware for express,
> with **properly typed request object**.
> Based on the widely popular [tguard](https://github.com/davidkarolyi/tguard) library.

![CI](https://github.com/davidkarolyi/express-tguard/workflows/CI/badge.svg)

## Installation

```sh
npm install express-tguard
```

or

```sh
yarn add express-tguard
```

## Example Usage

```ts
import express from "express";
import {
  validateSchema,
  RequestSchema,
  TString,
  TNumber,
  TArray,
} from "express-tguard";

const app = express();

app.post(
  "/users/:id",
  validateSchema(
    {
      params: { id: TString },
      body: { name: TString, age: TNumber, posts: TArray(TString) },
    },
    (req, res) => {
      // Now all validated types are available on the request object:
      const questions = req.body.posts.filter((post) => post.endsWith("?"));
      // typeof questions === string[]
      req.sendStatus(200);
    }
  )
);
```

### `validateSchema(schema: RequestSchema, handler?: RequestHandler): RequestHandler`

`validateSchema` accepts a `RequestSchema` ([learn more about `Schemas`](https://github.com/davidkarolyi/tguard#schema)),
and optionally a `RequestHandler`. This will be called if the request was valid.

If `handler` wasn't provided, than the `next()` function would be called.

When the request was invalid, it will respond with `400 Bad Request`,
and an error message in the `body`. For example:

```json
{
  "error": "Validation failed: Missing value at \"body.name\", expected type: string"
}
```

## tguard

Every other name were just re-exported from [`tguard`](https://github.com/davidkarolyi/tguard),
to learn more about `Guards`, `Validators` (`TSomething` values),
or how to reuse these type definitions: check out the [documentation](https://github.com/davidkarolyi/tguard#readme).
