import { createMemoryStorage } from '@varasto/memory-storage';
import express from 'express';
import request from 'supertest';
import * as yup from 'yup';

import { createRouter } from './router';

const VALID_MOCK_DATA = {
  name: 'John Doe',
  age: 25,
  email: 'john.doe@example.com',
};

describe('createRouter()', () => {
  const schema = yup.object().shape({
    name: yup.string().required(),
    age: yup.number().required().positive().integer(),
    email: yup.string().email(),
  });
  const storage = createMemoryStorage();
  const app = express();

  app.use('/people', createRouter(storage, 'people', schema));

  beforeEach(() => {
    storage.clear();
  });

  describe('listing', () => {
    it('should return items stored under the namespace', async () => {
      await storage.set('people', 'john-doe', VALID_MOCK_DATA);

      return request(app)
        .get('/people')
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({ 'john-doe': VALID_MOCK_DATA });
        });
    });

    it('should return empty object if the namespace does not exist', () =>
      request(app)
        .get('/people')
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({});
        }));
  });

  describe('retrieval', () => {
    it('should return the item if it exists', async () => {
      await storage.set('people', 'john-doe', VALID_MOCK_DATA);

      return request(app)
        .get('/people/john-doe')
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual(VALID_MOCK_DATA);
        });
    });

    it('should return 404 if the item does not exist', () =>
      request(app)
        .get('/people/john-doe')
        .then((response) => {
          expect(response.status).toBe(404);
        }));

    it('should return 400 if key is not valid slug', () =>
      request(app)
        .get('/people/f;oo')
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given key is not valid slug'
          );
        }));
  });

  describe('storage', () => {
    it('should return 201 after successful store', () =>
      request(app)
        .post('/people/john-doe')
        .send(VALID_MOCK_DATA)
        .then((response) => {
          expect(response.status).toBe(201);
        }));

    it('should return 400 if given data does not pass validation', () =>
      request(app)
        .post('/people/john-doe')
        .send({
          ...VALID_MOCK_DATA,
          age: -25,
        })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            error: 'Data did not pass validation.',
            errors: ['age must be a positive number'],
          });
        }));

    it('should return 400 if key is not valid slug', () =>
      request(app)
        .post('/people/f;o;o')
        .send(VALID_MOCK_DATA)
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given key is not valid slug'
          );
        }));
  });

  describe('patching', () => {
    it('should return the resulting patched object', async () => {
      await storage.set('people', 'john-doe', VALID_MOCK_DATA);

      return request(app)
        .patch('/people/john-doe')
        .send({ age: 26 })
        .then((response) => {
          expect(response.status).toBe(201);
          expect(response.body).toEqual({
            ...VALID_MOCK_DATA,
            age: 26,
          });
        });
    });

    it('should return 400 if given data does not pass validation', async () => {
      await storage.set('people', 'john-doe', VALID_MOCK_DATA);

      return request(app)
        .patch('/people/john-doe')
        .send({ email: 15 })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            error: 'Data did not pass validation.',
            errors: ['email must be a valid email'],
          });
        });
    });

    it('should return 404 if the item does not exist', () =>
      request(app)
        .patch('/people/john-doe')
        .send({ age: 26 })
        .then((response) => {
          expect(response.status).toBe(404);
        }));

    it('should return 400 if key is not valid slug', () =>
      request(app)
        .patch('/people/f;o;o')
        .send({ age: 26 })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given key is not valid slug'
          );
        }));
  });

  describe('removal', () => {
    it('should return the removed item if it existed', async () => {
      await storage.set('people', 'john-doe', VALID_MOCK_DATA);

      return request(app)
        .delete('/people/john-doe')
        .then((response) => {
          expect(response.status).toBe(201);
          expect(response.body).toEqual(VALID_MOCK_DATA);
        });
    });

    it('should return 404 if the item does not exist', () =>
      request(app)
        .delete('/people/john-doe')
        .then((response) => {
          expect(response.status).toBe(404);
        }));

    it('should return 400 if key is not valid slug', () =>
      request(app)
        .delete('/people/f;oo')
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given key is not valid slug'
          );
        }));
  });
});
