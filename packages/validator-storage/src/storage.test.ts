import { createMemoryStorage } from '@varasto/memory-storage';
import all from 'it-all';
import * as Yup from 'yup';

import { UnrecognizedNamespaceError } from './errors';
import { createValidatorStorage } from './storage';
import { NamespaceMapping } from './types';

const personSchema = Yup.object({
  name: Yup.string().required(),
  age: Yup.number().required().positive().integer(),
});

const taskSchema = Yup.object({
  text: Yup.string().required(),
  done: Yup.boolean().optional(),
});

const mapping: Readonly<NamespaceMapping> = {
  people: personSchema,
  tasks: taskSchema,
};

describe('createValidatorStorage()', () => {
  const backendStorage = createMemoryStorage();
  const storage = createValidatorStorage(backendStorage, mapping);

  beforeEach(() => backendStorage.clear());

  describe('has()', () => {
    it('should throw `UnrecognizedNamespaceError` if attempting to access non-mapped namespace', () =>
      expect(storage.has('items', 'sword')).rejects.toBeInstanceOf(
        UnrecognizedNamespaceError
      ));

    it('should ask from backend storage if the namespace is mapped', () =>
      expect(storage.has('people', 'john')).resolves.toBe(false));
  });

  describe('keys()', () => {
    it('should throw `UnrecognizedNamespaceError` if attempting to access non-mapped namespace', () =>
      expect(all(storage.keys('items'))).rejects.toBeInstanceOf(
        UnrecognizedNamespaceError
      ));

    it('should return keys from backend storage', async () => {
      await backendStorage.set('people', 'john', { name: 'John', age: 24 });

      expect(await all(storage.keys('people'))).toEqual(['john']);
    });

    it('should ask from backend storage if the namespace is mapped', () =>
      expect(all(storage.keys('people'))).resolves.toEqual([]));
  });

  describe('values()', () => {
    it('should throw `UnrecognizedNamespaceError` if attempting to access non-mapped namespace', () =>
      expect(all(storage.values('items'))).rejects.toBeInstanceOf(
        UnrecognizedNamespaceError
      ));

    it('should return values from backend storage', async () => {
      await backendStorage.set('people', 'john', { name: 'John', age: 24 });

      expect(await all(storage.values('people'))).toEqual([
        { name: 'John', age: 24 },
      ]);
    });

    it('should ask from backend storage if the namespace is mapped', () =>
      expect(all(storage.values('people'))).resolves.toEqual([]));
  });

  describe('entries()', () => {
    it('should throw `UnrecognizedNamespaceError` if attempting to access non-mapped namespace', () =>
      expect(all(storage.entries('items'))).rejects.toBeInstanceOf(
        UnrecognizedNamespaceError
      ));

    it('should return entries from backend storage', async () => {
      await backendStorage.set('people', 'john', { name: 'John', age: 24 });

      expect(await all(storage.entries('people'))).toEqual([
        ['john', { name: 'John', age: 24 }],
      ]);
    });

    it('should ask from backend storage if the namespace is mapped', () =>
      expect(all(storage.entries('people'))).resolves.toEqual([]));
  });

  describe('get()', () => {
    it('should throw `UnrecognizedNamespaceError` if attempting to access non-mapped namespace', () =>
      expect(storage.get('items', 'sword')).rejects.toBeInstanceOf(
        UnrecognizedNamespaceError
      ));

    it('should ask from backend storage if the namespace is mapped', async () => {
      await backendStorage.set('people', 'john', { name: 'john', age: 24 });

      await expect(storage.get('people', 'john')).resolves.toEqual({
        name: 'john',
        age: 24,
      });
    });
  });

  describe('set()', () => {
    it('should throw `UnrecognizedNamespaceError` if attempting to access non-mapped namespace', () =>
      expect(
        storage.set('items', 'sword', { broad: true })
      ).rejects.toBeInstanceOf(UnrecognizedNamespaceError));

    it('should allow inserting entries that pass the validation', async () => {
      await storage.set('people', 'john', { name: 'john', age: 24 });
      await storage.set('tasks', 'eat', { text: 'eat' });

      expect(await backendStorage.has('people', 'john'));
      expect(await backendStorage.has('tasks', 'eat'));
    });

    it('should reject entries that do not pass validation', () =>
      expect(
        storage.set('people', 'john', { name: 'john', age: -5 })
      ).rejects.toBeInstanceOf(Yup.ValidationError));
  });

  describe('update()', () => {
    it('should throw `UnrecognizedNamespaceError` if attempting to access non-mapped namespace', () =>
      expect(
        storage.update('items', 'sword', { long: true })
      ).rejects.toBeInstanceOf(UnrecognizedNamespaceError));

    it('should allow updating entries that pass the validation', async () => {
      await backendStorage.set('tasks', 'eat', { text: 'eat' });

      await storage.update('tasks', 'eat', { done: true });

      expect(await backendStorage.get('tasks', 'eat')).toHaveProperty(
        'done',
        true
      );
    });

    it('should reject entries that do not pass validation', async () => {
      await backendStorage.set('people', 'john', { name: 'john', age: 24 });

      await expect(
        storage.update('people', 'john', { age: -5 })
      ).rejects.toBeInstanceOf(Yup.ValidationError);
    });
  });

  describe('delete()', () => {
    it('should throw `UnrecognizedNamespaceError` if attempting to access non-mapped namespace', () =>
      expect(storage.delete('items', 'sword')).rejects.toBeInstanceOf(
        UnrecognizedNamespaceError
      ));

    it('should ask from backend storage if the namespace is mapped', async () => {
      await backendStorage.set('tasks', 'eat', { text: 'eat', done: true });

      expect(await storage.delete('tasks', 'eat')).toBe(true);
      expect(await backendStorage.has('tasks', 'eat')).toBe(false);
    });
  });
});
