# @varasto/server

HTTP interface implementation to Varasto key-value store. Can be run standalone
or embedded to other [Express.js](https://expressjs.com/) applications.

## Installation

```bash
$ npm install @varasto/server
```

## Usage

The package provides an function called `createServer`, which returns an
Express.js application.

Basic usage looks like this:

```TypeScript
import { createServer } from '@varasto/server';
import express from 'express';

const app = express();

app.use('/varasto', createServer());
```

The function takes an optional configuration object, which can be used to
enable basic authentication when `auth` property is provided which has
`username` and `password` properties. For example:

```TypeScript
app.use(
  '/varasto',
  createServer({
    auth: {
      username: 'AzureDiamond',
      password: 'hunter2'
    }
  })
);
```
