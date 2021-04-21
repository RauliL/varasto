# @varasto/express-crud

Utility for generating [Express.js] [router] that handles [CRUD] operations for
a single namespace in Varasto storage, with validation performed by [Yup].

[express.js]: https://expressjs.com/
[router]: https://expressjs.com/en/4x/api.html#router
[crud]: https://en.wikipedia.org/wiki/Create,_read,_update_and_delete
[yup]: https://github.com/jquense/yup

## Installation

```bash
$ npm install --save @varasto/express-crud
```

## Usage

The package provides an function called `createRouter`, which creates an
Express.js [router] that provides basic [CRUD] operations to an namespace
in Varasto storage, with validation provided by [Yup].

```TypeScript
import { createRouter } from '@varasto/express-crud';
import { createStorage } from '@varasto/storage';
import express from 'express';
import * as yup from 'yup';

const storage = createStorage({ dir: './data' });

const peopleSchema = yup.object().shape({
  name: yup.string().required(),
  age: yup.number().required().positive().integer(),
  email: yup.string().email(),
});

const app = express();

express.use(
  '/api/people',
  createRouter(storage, 'people', peopleSchema)
);
```

The Express.js application will now respond to `GET`, `POST`, `PATCH` and
`DELETE` requests made into URI `/api/people`. Data passed with `POST` and
`PATCH` requests must pass schema validation. All data will be stored under
namespace `people`.
