import { createMemoryStorage } from '@varasto/memory-storage';
import express from 'express';
import isUUID from 'is-uuid';
import all from 'it-all';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod/v4';

import { createRouter } from './router';
import { RouterOptions } from './types';

const personSchema = z.object({
  name: z.string(),
  age: z.number().positive().int(),
  email: z.email().optional(),
});

const validPersonData = {
  name: 'John Doe',
  age: 25,
  email: 'john.doe@example.com',
};

describe('createRouter()', () => {
  const storage = createMemoryStorage();
  const createApp = (options: Partial<RouterOptions> = {}) => {
    const app = express();

    app.use('/people', createRouter(storage, 'people', options));

    return app;
  };

  beforeEach(() => {
    storage.clear();
  });

  describe('listing', () => {
    it('should return entries stored under the namespace', async () => {
      const app = createApp();

      await storage.set('people', 'john-doe', validPersonData);

      return expect(request(app).get('/people')).resolves.toMatchObject({
        status: 200,
        body: { 'john-doe': validPersonData },
      });
    });

    it('should return empty object if the namespace does not exist', () =>
      expect(request(createApp()).get('/people')).resolves.toMatchObject({
        status: 200,
        body: {},
      }));
  });

  describe('retrieval', () => {
    it('should return the entry value if it exists', async () => {
      const app = createApp();

      await storage.set('people', 'john-doe', validPersonData);

      return expect(
        request(app).get('/people/john-doe')
      ).resolves.toMatchObject({
        status: 200,
        body: validPersonData,
      });
    });

    it('should return 404 if the entry does not exist', () =>
      expect(
        request(createApp()).get('/people/john-doe')
      ).resolves.toHaveProperty('status', 404));

    it('should return 400 if key is not valid slug', () =>
      expect(request(createApp()).get('/people/f;oo')).resolves.toMatchObject({
        status: 400,
        body: {
          error: 'Given key is not valid slug',
        },
      }));
  });

  describe('creation', () => {
    it('should assign UUID as key if not custom key generator given', () =>
      request(createApp())
        .post('/people')
        .send(validPersonData)
        .then(async (response) => {
          expect(response.status).toBe(201);
          expect(response.body).toHaveProperty('key');
          expect(isUUID.v4(response.body.key)).toBe(true);
          expect(await storage.get('people', response.body.key)).toEqual(
            validPersonData
          );
        }));

    it('should use custom key generator if one is given', () =>
      request(createApp({ keyGenerator: () => 'test' }))
        .post('/people')
        .send(validPersonData)
        .then(async (response) => {
          const entries = await all(storage.entries('people'));

          expect(response.status).toBe(201);
          expect(entries).toEqual([['test', validPersonData]]);
        }));

    it('should validate data against schema, if one is given', () =>
      expect(
        request(createApp({ schema: personSchema }))
          .post('/people')
          .send({ ...validPersonData, age: -25 })
      ).resolves.toMatchObject({
        status: 400,
        body: {
          error: 'Data did not pass validation.',
        },
      }));
  });

  describe('replacement', () => {
    it('should return 201 after successful replacement', async () => {
      await storage.set('people', 'john-doe', validPersonData);

      return expect(
        request(createApp())
          .post('/people/john-doe')
          .send({ ...validPersonData, age: 26 })
      ).resolves.toMatchObject({ status: 201, body: { age: 26 } });
    });

    it('should validate data against schema, if one is given', async () => {
      await storage.set('people', 'john-doe', validPersonData);

      return expect(
        request(createApp({ schema: personSchema }))
          .post('/people/john-doe')
          .send({ ...validPersonData, age: -25 })
      ).resolves.toMatchObject({
        status: 400,
        body: {
          error: 'Data did not pass validation.',
        },
      });
    });

    it('should return 404 if the entry does not exist', () =>
      expect(
        request(createApp()).post('/people/john-doe').send(validPersonData)
      ).resolves.toHaveProperty('status', 404));

    it('should return 400 if key is not valid slug', () =>
      expect(
        request(createApp()).post('/people/f;oo').send(validPersonData)
      ).resolves.toMatchObject({
        status: 400,
        body: {
          error: 'Given key is not valid slug',
        },
      }));
  });

  describe('patching', () => {
    it('should return the resulting patched object', async () => {
      await storage.set('people', 'john-doe', validPersonData);

      return expect(
        request(createApp()).patch('/people/john-doe').send({ age: 26 })
      ).resolves.toMatchObject({ status: 201, body: { age: 26 } });
    });

    it('should validate data against schema, if one is given', async () => {
      await storage.set('people', 'john-doe', validPersonData);

      return expect(
        request(createApp({ schema: personSchema }))
          .patch('/people/john-doe')
          .send({ age: -25 })
      ).resolves.toMatchObject({
        status: 400,
        body: {
          error: 'Data did not pass validation.',
        },
      });
    });

    it('should return 404 if the entry does not exist', () =>
      expect(
        request(createApp()).patch('/people/john-doe').send({ age: 26 })
      ).resolves.toHaveProperty('status', 404));

    it('should return 400 if key is not valid slug', () =>
      expect(
        request(createApp()).patch('/people/f;oo').send({ age: 26 })
      ).resolves.toMatchObject({
        status: 400,
        body: { error: 'Given key is not valid slug' },
      }));
  });

  describe('removal', () => {
    it('should return the value of the removed entry if it existed', async () => {
      const app = createApp();

      await storage.set('people', 'john-doe', validPersonData);

      return expect(
        request(app).delete('/people/john-doe')
      ).resolves.toMatchObject({ status: 201, body: validPersonData });
    });

    it('should return 404 if the entry does not exist', () =>
      expect(
        request(createApp()).delete('/people/john-doe')
      ).resolves.toHaveProperty('status', 404));

    it('should return 400 if key is not valid slug', () =>
      expect(
        request(createApp()).delete('/people/f;oo')
      ).resolves.toMatchObject({
        status: 400,
        body: { error: 'Given key is not valid slug' },
      }));
  });
});
