import { InvalidSlugError, Storage } from '@varasto/storage';
import express, { Request, Response, Router } from 'express';
import { JsonObject } from 'type-fest';
import { AnySchema, ValidationError } from 'yup';

/**
 * Constructs an router that provides CRUD operations for an namespace in given
 * storage. All data passed through `POST` or `PATCH` operations must pass
 * validation provided by given schema.
 *
 * @param storage Varasto storage to used for storing the data.
 * @param namespace Namespace where the data will be stored into.
 * @param schema An Yup schema which will be used to validate all incoming
 *               data.
 * @returns An Express.js router that provides CRUD operations which work on
 *          data stored in specified namespace in the Varasto storage.
 */
export const createRouter = (
  storage: Storage,
  namespace: string,
  schema: AnySchema,
): Router => {
  const router = express();

  const retrieve = (
    callback: (req: Request, res: Response, value: JsonObject) => void,
  ) => (req: Request, res: Response) => {
    storage
      .get(namespace, req.params.key)
      .then((value) => {
        if (value === undefined) {
          res.status(404).json({ error: 'Item does not exist.' });
        } else {
          callback(req, res, value as JsonObject);
        }
      })
      .catch((err) => {
        if (err instanceof InvalidSlugError) {
          res.status(400).json({ error: err.message });
        } else {
          res.status(500).json({ error: 'Unable to retrieve item.' });
        }
      });
  };

  const store = (req: Request, res: Response, value: JsonObject) => {
    schema
      .validate(value, {
        strict: false,
        stripUnknown: true,
      })
      .then((validValue) => {
        storage
          .set(namespace, req.params.key, validValue)
          .then(() => {
            res.status(201).json(validValue);
          })
          .catch((err) => {
            if (err instanceof InvalidSlugError) {
              res.status(400).json({ error: err.message });
            } else {
              res.status(500).json({ error: 'Unable to store item.' });
            }
          });
      })
      .catch((err: ValidationError) => {
        res.status(400).json({
          error: 'Data did not pass validation.',
          errors: err.errors,
        });
      });
  };

  router.use(express.json());

  router.get('/', (req, res) => {
    storage
      .entries(namespace)
      .then((entries) => {
        res.status(200).json(
          entries.reduce(
            (mapping, entry) => ({
              ...mapping,
              [entry[0]]: entry[1],
            }),
            {},
          ),
        );
      })
      .catch((err) => {
        if (err instanceof InvalidSlugError) {
          res.status(400).json({ error: err.message });
        } else {
          res.status(500).json({ error: 'Unable to retrieve items.' });
        }
      });
  });

  router.get('/:key', retrieve((req, res, value) => {
    res.status(200).json(value);
  }));

  router.post('/:key', (req, res) => {
    store(req, res, req.body);
  });

  router.patch('/:key', retrieve((req, res, value) => {
    store(req, res, { ...value, ...req.body });
  }));

  router.delete('/:key', retrieve((req, res, value) => {
    storage
      .delete(namespace, req.params.key)
      .then(() => {
        res.status(201).json(value);
      })
      .catch(() => {
        res.status(500).json({ error: 'Unable to remove item.' });
      });
  }));

  return router;
};
