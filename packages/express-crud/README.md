# @varasto/express-crud

Utility for generating [Express.js] [router] that handles [CRUD] operations for
a single namespace in Varasto storage, with optional validation performed by
[Yup].

It is similar to [Varasto server] (which can also be used as [Express.js]
[router]) expect that it only handles single namespace in the storage,
generates automatically keys for new items stored in the namespace and provides
optional validation.

[express.js]: https://expressjs.com/
[router]: https://expressjs.com/en/4x/api.html#router
[crud]: https://en.wikipedia.org/wiki/Create,_read,_update_and_delete
[yup]: https://github.com/jquense/yup
[varasto server]: https://www.npmjs.com/package/@varasto/server

## Installation

```bash
$ npm install --save @varasto/express-crud
```

## Usage

The package provides an function called `createRouter`, which creates an
Express.js [router] that provides basic [CRUD] operations to an namespace
in Varasto storage, with optional validation provided by [Yup].

```TypeScript
import { createRouter } from '@varasto/express-crud';
import { createFileSystemStorage } from '@varasto/fs-storage';
import express from 'express';
import * as yup from 'yup';

const storage = createFileSystemStorage({ dir: './data' });

const personSchema = yup.object().shape({
  name: yup.string().required(),
  age: yup.number().required().positive().integer(),
  email: yup.string().email(),
});

const app = express();

express.use(
  '/api/people',
  createRouter(storage, 'people', { schema: personSchema })
);
```

The Express.js application will now respond to `GET`, `POST`, `PATCH` and
`DELETE` requests made into URI `/api/people`. Data passed with `POST` and
`PATCH` requests must pass schema validation, if one is provided. All data
will be stored under namespace `people`.

### Options

The function takes an optional configuration object, which supports these
settings:

#### `schema`

Optional [Yup] schema to which all data is validated against. If omitted, no
validation is performed at all.

#### `keyGenerator`

Optional function that will be used to generate keys for new entries that are
created with `POST` requests. If omitted, [UUID] keys will be generated for all
new entries intead.

[uuid]: https://en.wikipedia.org/wiki/Universally_unique_identifier

### Listing items

To list all items stored under the namespace, you make an `GET` request without
any key included in the request path.

```http
GET / HTTP/1.0
```

To which the router will respond with an JSON object which contains each item
stored under the namespace mapped with the key that is used to identify each
individual item.

```JSON
{
  "b24ed42e-6ffd-11ec-a909-97c71e1c1df5": {
    "name": "John Doe",
    "age": 25,
    "email": "john.doe@example.com"
  },
  "bc846d00-6ffd-11ec-972a-a7b216391618": {
    "name": "Jane Doe",
    "age": 30,
    "email": "jane.doe@example.com"
  }
}
```

### Creating new items

To create new item under the namespace, you make an `POST` request without any
key included in the request path, with value of the new item included in the
request body as JSON.

```http
POST / HTTP/1.0
Content-Type: application/json
Content-Length: 72

{
  "name": "John Doe",
  "age": 25,
  "email": "john.doe@example.com"
}
```

The router will assign an key to the newly created item which will be used to
identify the item with. Key of the item will be returned as the response.

This key can be later used to identify the created item.

```JSON
{
  "key": "403ecc3e-6fff-11ec-87d5-bf4f846a6b19"
}
```

### Replacing existing items

To replace an already existing item, you make an `POST` request with key of the
item you wish to replace as part of the request path, with new value of the
item included in the request body as JSON.

```http
POST /403ecc3e-6fff-11ec-87d5-bf4f846a6b19 HTTP/1.0
Content-Type: application/json
Content-Length: 72

{
  "name": "John Doe",
  "age": 26,
  "email": "john.doe@example.com"
}
```

If the item does not exist in the namespace, 404 will be returned as response
instead.

If optional schema was given to the router, an validation will be performed
against it. If the given data does not pass the validation 404 error will be
returned as response, with the response body containing details on why the
validation failed.

### Updating existing items

To partially update an already existing item, you make an `PATCH` request with
key of the item you wish to update as part of the request path. The JSON
included in response body will be shallowly merged with the already existing
data and the result will be sent as response.

```http
PATCH /403ecc3e-6fff-11ec-87d5-bf4f846a6b19 HTTP/1.0
Content-Type: application/json
Content-Length: 15

{
  "age": 26
}
```

And the server will respond with:

```JSON
{
  "name": "John Doe",
  "age": 26,
  "email": "john.doe@example.com"
}
```

If the item does not exist in the namespace, 404 will be returned as response
instead.

If optional schema was given to the router, an validation will be performed
against it. If the updated data does not pass the validation 404 error will be
returned as response, with the response body containing details on why the
validation failed.

### Removing items

To remove an item, you make a `DELETE` request with key of the item you wish to
delete as part of the request path.

```http
DELETE /403ecc3e-6fff-11ec-87d5-bf4f846a6b19 HTTP/1.0
```

If the item exists in the namespace, it will be removed and it's value is
returned as response. If the item does not exist, 404 error will be returned
as response instead.
