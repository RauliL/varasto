import { createMockStorage } from '@varasto/mock-storage';
import request from 'supertest';

import { createServer } from './server';

describe('HTTP interface', () => {
  const storage = createMockStorage();
  const app = createServer(storage);

  beforeEach(() => {
    storage.clear();
  });

  describe('listing', () => {
    it('should return items stored under the namespace', async (done) => {
      await storage.set('foo', 'bar', { a: 1 });
      await storage.set('foo', 'baz', { b: 2 });

      request(app)
        .get('/foo')
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            bar: { a: 1 },
            baz: { b: 2 },
          });
          done();
        });
    });

    it('should return empty object if the namespace does not exist', (done) => {
      request(app)
        .get('/foo')
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({});
          done();
        });
    });

    it('should return 400 if namespace is not valid slug', (done) => {
      request(app)
        .get('/f;o;o')
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given namespace is not valid slug'
          );
          done();
        });
    });
  });

  describe('retrieval', () => {
    it('should return the item if it exists', async (done) => {
      await storage.set('foo', 'bar', { foo: 'bar' });

      request(app)
        .get('/foo/bar')
        .then((response) => {
          expect(response.status).toBe(200);
          expect(response.body).toEqual({ foo: 'bar' });
          done();
        });
    });

    it('should return 404 if the item does not exist', (done) => {
      request(app)
        .get('/foo/bar')
        .then((response) => {
          expect(response.status).toBe(404);
          done();
        });
    });

    it('should return 400 if namespace is not valid slug', (done) => {
      request(app)
        .get('/f;o;o/bar')
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given namespace is not valid slug'
          );
          done();
        });
    });

    it('should return 400 if key is not valid slug', (done) => {
      request(app)
        .get('/foo/b;a;r')
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
        .post('/foo/bar')
        .send({ foo: 'bar' })
        .then((response) => {
          expect(response.status).toBe(201);
          done();
        });
    });

    it('should return 400 if namespace is not valid slug', (done) => {
      request(app)
        .post('/f;o;o/bar')
        .send({ foo: 'bar' })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given namespace is not valid slug'
          );
          done();
        });
    });

    it('should return 400 if key is not valid slug', (done) => {
      request(app)
        .post('/foo/b;a;r')
        .send({ foo: 'bar' })
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
      await storage.set('foo', 'bar', { a: 1 });

      request(app)
        .patch('/foo/bar')
        .send({ b: 2 })
        .then((response) => {
          expect(response.status).toBe(201);
          expect(response.body).toEqual({
            a: 1,
            b: 2,
          });
          done();
        });
    });

    it('should return 404 if the item does not exist', (done) => {
      request(app)
        .patch('/foo/bar')
        .send({ b: 2 })
        .then((response) => {
          expect(response.status).toBe(404);
          done();
        });
    });

    it('should return 400 if namespace is not valid slug', (done) => {
      request(app)
        .patch('/f;o;o/bar')
        .send({ b: 2 })
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given namespace is not valid slug'
          );
          done();
        });
    });

    it('should return 400 if key is not valid slug', (done) => {
      request(app)
        .patch('/foo/b;a;r')
        .send({ b: 2 })
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
      await storage.set('foo', 'bar', { foo: 'bar' });

      request(app)
        .delete('/foo/bar')
        .then((response) => {
          expect(response.status).toBe(201);
          expect(response.body).toEqual({ foo: 'bar' });
          done();
        });
    });

    it('should return 404 if the item does not exist', (done) => {
      request(app)
        .delete('/foo/bar')
        .then((response) => {
          expect(response.status).toBe(404);
          done();
        });
    });

    it('should return 400 if namespace is not valid slug', (done) => {
      request(app)
        .delete('/f;o;o/bar')
        .then((response) => {
          expect(response.status).toBe(400);
          expect(response.body).toHaveProperty(
            'error',
            'Given namespace is not valid slug'
          );
          done();
        });
    });

    it('should return 400 if key is not valid slug', (done) => {
      request(app)
        .delete('/foo/b;a;r')
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
