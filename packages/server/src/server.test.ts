import { createMemoryStorage } from '@varasto/memory-storage';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { createServer } from './server';

describe('HTTP interface', () => {
  const storage = createMemoryStorage();
  const app = createServer(storage);

  beforeEach(() => {
    storage.clear();
  });

  describe('listing', () => {
    it('should return items stored under the namespace', async () => {
      await storage.set('foo', 'bar', { a: 1 });
      await storage.set('foo', 'baz', { b: 2 });

      return request(app)
        .get('/foo')
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            bar: { a: 1 },
            baz: { b: 2 },
          });
        });
    });

    it('should return empty object if the namespace does not exist', () =>
      request(app)
        .get('/foo')
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({});
        }));

    it('should return 400 if namespace is not valid slug', () =>
      request(app)
        .get('/f;o;o')
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given namespace is not valid slug'
          );
        }));
  });

  describe('retrieval', () => {
    it('should return the item if it exists', async () => {
      await storage.set('foo', 'bar', { foo: 'bar' });

      return request(app)
        .get('/foo/bar')
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({ foo: 'bar' });
        });
    });

    it('should return 404 if the item does not exist', () =>
      request(app)
        .get('/foo/bar')
        .then((response) => {
          expect(response.status).toBe(404);
        }));

    it('should return 400 if namespace is not valid slug', () =>
      request(app)
        .get('/f;o;o/bar')
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given namespace is not valid slug'
          );
        }));

    it('should return 400 if key is not valid slug', () =>
      request(app)
        .get('/foo/b;a;r')
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given key is not valid slug'
          );
        }));

    it('should respond to HEAD request if item exists', async () => {
      await storage.set('foo', 'bar', { foo: 'bar' });

      return request(app)
        .head('/foo/bar')
        .then((response) => {
          expect(response.status).toBe(200);
        });
    });

    it('should respond to HEAD request if item does not exist', () =>
      request(app)
        .head('/foo/bar')
        .then((response) => {
          expect(response.status).toBe(404);
        }));
  });

  describe('storage', () => {
    it('should return 201 after successful store', () =>
      request(app)
        .post('/foo/bar')
        .send({ foo: 'bar' })
        .then((response) => {
          expect(response.status).toBe(201);
        }));

    it('should return 400 if namespace is not valid slug', () =>
      request(app)
        .post('/f;o;o/bar')
        .send({ foo: 'bar' })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given namespace is not valid slug'
          );
        }));

    it('should return 400 if key is not valid slug', () =>
      request(app)
        .post('/foo/b;a;r')
        .send({ foo: 'bar' })
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
      await storage.set('foo', 'bar', { a: 1 });

      return request(app)
        .patch('/foo/bar')
        .send({ b: 2 })
        .then((response) => {
          expect(response.status).toBe(201);
          expect(response.body).toEqual({
            a: 1,
            b: 2,
          });
        });
    });

    it('should return 404 if the item does not exist', () =>
      request(app)
        .patch('/foo/bar')
        .send({ b: 2 })
        .then((response) => {
          expect(response.status).toBe(404);
        }));

    it('should return 400 if namespace is not valid slug', () =>
      request(app)
        .patch('/f;o;o/bar')
        .send({ b: 2 })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given namespace is not valid slug'
          );
        }));

    it('should return 400 if key is not valid slug', () =>
      request(app)
        .patch('/foo/b;a;r')
        .send({ b: 2 })
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
      await storage.set('foo', 'bar', { foo: 'bar' });

      return request(app)
        .delete('/foo/bar')
        .then((response) => {
          expect(response.status).toBe(201);
          expect(response.body).toEqual({ foo: 'bar' });
        });
    });

    it('should return 404 if the item does not exist', () =>
      request(app)
        .delete('/foo/bar')
        .then((response) => {
          expect(response.status).toBe(404);
        }));

    it('should return 400 if namespace is not valid slug', () =>
      request(app)
        .delete('/f;o;o/bar')
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given namespace is not valid slug'
          );
        }));

    it('should return 400 if key is not valid slug', () =>
      request(app)
        .delete('/foo/b;a;r')
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given key is not valid slug'
          );
        }));
  });
});
