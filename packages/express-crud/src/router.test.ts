import { createMockStorage } from '@varasto/mock-storage';
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
  const storage = createMockStorage();
  const app = express();

  app.use('/people', createRouter(storage, 'people', schema));

  beforeEach(() => {
    storage.clear();
  });

  describe('listing', () => {
    it('should return items stored under the namespace', async (done) => {
      await storage.set('people', 'john-doe', VALID_MOCK_DATA);

      request(app)
        .get('/people')
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({ 'john-doe': VALID_MOCK_DATA });
          done();
        });
    });

    it('should return empty object if the namespace does not exist', (done) => {
      request(app)
        .get('/people')
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({});
          done();
        });
    });
  });

  describe('retrieval', () => {
    it('should return the item if it exists', async (done) => {
      await storage.set('people', 'john-doe', VALID_MOCK_DATA);

      request(app)
        .get('/people/john-doe')
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual(VALID_MOCK_DATA);
          done();
        });
    });

    it('should return 404 if the item does not exist', (done) => {
      request(app)
        .get('/people/john-doe')
        .then((response) => {
          expect(response.status).toBe(404);
          done();
        });
    });

    it('should return 400 if key is not valid slug', (done) => {
      request(app)
        .get('/people/f;oo')
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given key is not valid slug'
          );
          done();
        });
    });
  });

  describe('storage', () => {
    it('should return 201 after successful store', (done) => {
      request(app)
        .post('/people/john-doe')
        .send(VALID_MOCK_DATA)
        .then((response) => {
          expect(response.status).toBe(201);
          done();
        });
    });

    it('should return 400 if given data does not pass validation', (done) => {
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
          done();
        })
    });

    it('should return 400 if key is not valid slug', (done) => {
      request(app)
        .post('/people/f;o;o')
        .send(VALID_MOCK_DATA)
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given key is not valid slug'
          );
          done();
        });
    });
  });

  describe('patching', () => {
    it('should return the resulting patched object', async (done) => {
      await storage.set('people', 'john-doe', VALID_MOCK_DATA);

      request(app)
        .patch('/people/john-doe')
        .send({ age: 26 })
        .then((response) => {
          expect(response.status).toBe(201);
          expect(response.body).toEqual({
            ...VALID_MOCK_DATA,
            age: 26,
          });
          done();
        });
    });

    it('should return 400 if given data does not pass validation', async (done) => {
      await storage.set('people', 'john-doe', VALID_MOCK_DATA);

      request(app)
        .patch('/people/john-doe')
        .send({ email: 15 })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            error: 'Data did not pass validation.',
            errors: ['email must be a valid email'],
          });
          done();
        });
    });

    it('should return 404 if the item does not exist', (done) => {
      request(app)
        .patch('/people/john-doe')
        .send({ age: 26 })
        .then((response) => {
          expect(response.status).toBe(404);
          done();
        });
    });

    it('should return 400 if key is not valid slug', (done) => {
      request(app)
        .patch('/people/f;o;o')
        .send({ age: 26 })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given key is not valid slug'
          );
          done();
        });
    });
  });

  describe('removal', () => {
    it('should return the removed item if it existed', async (done) => {
      await storage.set('people', 'john-doe', VALID_MOCK_DATA);

      request(app)
        .delete('/people/john-doe')
        .then((response) => {
          expect(response.status).toBe(201);
          expect(response.body).toEqual(VALID_MOCK_DATA);
          done();
        });
    });

    it('should return 404 if the item does not exist', (done) => {
      request(app)
        .delete('/people/john-doe')
        .then((response) => {
          expect(response.status).toBe(404);
          done();
        });
    });

    it('should return 400 if key is not valid slug', (done) => {
      request(app)
        .delete('/people/f;oo')
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given key is not valid slug'
          );
          done();
        });
    });
  });
});
