import basicAuth from 'basic-auth';
import express from 'express';
import { Express } from 'express-serve-static-core';
import morgan from 'morgan';

import { Storage } from 'varasto-storage';

export interface ServerOptions {
  auth?: {
    username: string;
    password: string;
  };
}

export const createServer = (
  storage: Storage,
  options: Partial<ServerOptions> = {}
): Express => {
  const server = express();

  server.use(express.json());
  server.use(morgan('combined'));

  if (options && options.auth) {
    const { username, password } = options.auth;

    server.use((req, res, next) => {
      const credentials = basicAuth(req);

      if (!credentials ||
          credentials.name !== username ||
          credentials.pass !== password) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="varasto"');
        res.end('Unauthorized');
        return;
      }

      next();
    });
  }

  server.get('/:key', (req, res) => (
    storage.getItem(req.params.key)
      .then((value) => {
        if (typeof value === 'undefined') {
          res.status(404).json({
            error: 'Item does not exist.',
          });
        } else {
          res.status(200).json(value);
        }
      })
      .catch(() => res.status(500).json({
        error: 'Unable to retrieve item.',
      }))
  ));

  server.post('/:key', (req, res) => (
    storage.setItem(req.params.key, req.body)
      .then(() => res.status(201).json(req.body))
      .catch(() => res.status(500).json({
        error: 'Unable to store item.',
      }))
  ));

  server.patch('/:key', (req, res) => (
    storage.getItem(req.params.key)
      .then((value) => {
        if (typeof value === 'undefined') {
          res.status(404).json({
            error: 'Item does not exist.',
          });
          return;
        }

        const result = {...value, ...req.body};

        storage.setItem(req.params.key, result)
          .then(() => res.status(201).json(result))
          .catch(() => res.status(500).json({
            error: 'Unable to store item.',
          }));
      })
      .catch(() => res.status(500).json({
        error: 'Unable to retrieve item.',
      }))
  ));

  server.delete('/:key', (req, res) => (
    storage.getItem(req.params.key)
      .then((value) => {
        if (typeof value === 'undefined') {
          res.status(404).json({
            error: 'Item does not exist.',
          });
        } else {
          storage.removeItem(req.params.key)
            .then(() => res.status(201).json(value))
            .catch(() => res.status(500).json({
              error: 'Unable to remove item.',
            }));
        }
      })
      .catch(() => res.status(500).json({
        error: 'Unable to remove item.',
      }))
  ));

  return server;
};
