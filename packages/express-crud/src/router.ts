import { InvalidSlugError, Storage } from '@varasto/storage';

import express, { Response, Router } from 'express';
import { v4 as uuid } from 'uuid';
import { JsonObject } from 'type-fest';
import { ValidationError } from 'yup';

import { RouterOptions } from './types';

/**
 * Constructs an router that provides CRUD operations for an namespace in given
 * storage. All data passed through `POST` or `PATCH` operations must pass
 * validation provided by given schema.
 *
 * @param storage Varasto storage to used for storing the data.
 * @param namespace Namespace where the data will be stored into.
 * @param options Various options that can be given to the router.
 * @returns An Express.js router that provides CRUD operations which work on
 *          data stored in specified namespace in the Varasto storage.
 */
export const createRouter = <T extends JsonObject = JsonObject>(
  storage: Storage,
  namespace: string,
  options: Partial<RouterOptions<T>> = {}
): Router => {
  const router = express();
  const schema = options.schema;
  const keyGenerator = options.keyGenerator ?? uuid;

  const validate = (
    res: Response,
    data: T,
    onSuccess: (validData: T) => void
  ) => {
    if (schema) {
      schema
        .validate(data, {
          strict: false,
          stripUnknown: true,
        })
        .then(onSuccess)
        .catch((err: ValidationError) => {
          res.status(400).json({
            error: 'Data did not pass validation.',
            errors: err.errors,
          });
        });
    } else {
      onSuccess(data);
    }
  };

  const get = (res: Response, key: string, onSuccess: (value: T) => void) => {
    storage
      .get<T>(namespace, key)
      .then((value) => {
        if (value === undefined) {
          res.status(404).json({ error: 'Item does not exist.' });
        } else {
          onSuccess(value);
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

  const store = (res: Response, key: string, data: T) => {
    validate(res, data, (validData) => {
      storage
        .set<T>(namespace, key, validData)
        .then(() => {
          res.status(201).json(validData);
        })
        .catch((err) => {
          if (err instanceof InvalidSlugError) {
            res.status(400).json({ error: err.message });
          } else {
            res.status(500).json({ error: 'Unable to store item.' });
          }
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
            {}
          )
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

  router.get('/:key', (req, res) => {
    get(res, req.params.key, (value) => {
      res.status(200).json(value);
    });
  });

  router.post('/', (req, res) => {
    validate(res, req.body, (validData) => {
      const key = keyGenerator(validData);

      storage
        .set<T>(namespace, key, validData)
        .then(() => {
          res.status(201).json({ key });
        })
        .catch((err) => {
          if (err instanceof InvalidSlugError) {
            res.status(400).json({ error: err.message });
          } else {
            res.status(500).json({ error: 'Unable to store item.' });
          }
        });
    });
  });

  router.post('/:key', (req, res) => {
    const { key } = req.params;

    get(res, key, () => {
      store(res, key, req.body);
    });
  });

  router.patch('/:key', (req, res) => {
    const { key } = req.params;

    get(res, key, (oldData) => {
      store(res, key, { ...oldData, ...req.body });
    });
  });

  router.delete('/:key', (req, res) => {
    const { key } = req.params;

    get(res, key, (value) => {
      storage
        .delete(namespace, req.params.key)
        .then(() => {
          res.status(201).json(value);
        })
        .catch((err) => {
          if (err instanceof InvalidSlugError) {
            res.status(400).json({ error: err.message });
          } else {
            res.status(500).json({ error: 'Unable to remove item.' });
          }
        });
    });
  });

  return router;
};
