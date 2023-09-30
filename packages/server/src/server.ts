import {
  InvalidSlugError,
  ItemDoesNotExistError,
  Storage,
} from '@varasto/storage';
import basicAuth from 'basic-auth';
import express from 'express';
import { Express } from 'express-serve-static-core';
import { JsonObject } from 'type-fest';

import { ServerOptions } from './types';

export const createServer = (
  storage: Storage,
  options: Partial<ServerOptions> = {}
): Express => {
  const server = express();

  server.use(express.json());

  if (options?.auth) {
    const { username, password } = options.auth;

    server.use((req, res, next) => {
      const credentials = basicAuth(req);

      if (
        !credentials ||
        credentials.name !== username ||
        credentials.pass !== password
      ) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="varasto"');
        res.end('Unauthorized');
        return;
      }

      next();
    });
  }

  server.get('/:namespace', async (req, res) => {
    try {
      const result: Record<string, JsonObject> = {};

      for await (const entry of storage.entries(req.params.namespace)) {
        result[entry[0]] = entry[1];
      }
      res.status(200).json(result);
    } catch (err) {
      if (err instanceof InvalidSlugError) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: 'Unable to retrieve items.' });
      }
    }
  });

  server.get('/:namespace/:key', (req, res) => {
    const { namespace, key } = req.params;

    storage
      .get(namespace, key)
      .then((value) => {
        if (value === undefined) {
          res.status(404).json({ error: 'Item does not exist.' });
        } else {
          res.status(200).json(value);
        }
      })
      .catch((err) => {
        if (err instanceof InvalidSlugError) {
          res.status(400).json({ error: err.message });
        } else {
          res.status(500).json({ error: 'Unable to retrieve item.' });
        }
      });
  });

  server.post('/:namespace/:key', (req, res) => {
    const { namespace, key } = req.params;

    storage
      .set(namespace, key, req.body)
      .then(() => res.status(201).json(req.body))
      .catch((err) => {
        if (err instanceof InvalidSlugError) {
          res.status(400).json({ error: err.message });
        } else {
          res.status(500).json({ error: 'Unable to store item.' });
        }
      });
  });

  server.patch('/:namespace/:key', (req, res) => {
    const { namespace, key } = req.params;

    storage
      .update(namespace, key, req.body)
      .then((result) => res.status(201).json(result))
      .catch((err) => {
        if (err instanceof InvalidSlugError) {
          res.status(400).json({ error: err.message });
        } else if (err instanceof ItemDoesNotExistError) {
          res.status(404).json({ error: 'Item does not exist.' });
        } else {
          res.status(500).json({ error: 'Unable to store item.' });
        }
      });
  });

  server.delete('/:namespace/:key', (req, res) => {
    const { namespace, key } = req.params;

    storage
      .get(namespace, key)
      .then((value) => {
        if (value === undefined) {
          res.status(404).json({ error: 'Item does not exist.' });
          return;
        }

        storage
          .delete(namespace, key)
          .then(() => res.status(201).json(value))
          .catch(() =>
            res.status(500).json({
              error: 'Unable to remove item.',
            })
          );
      })
      .catch((err) => {
        if (err instanceof InvalidSlugError) {
          res.status(400).json({ error: err.message });
        } else {
          res.status(500).json({ error: 'Unable to remove item.' });
        }
      });
  });

  return server;
};
