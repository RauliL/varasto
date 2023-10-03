import { isValidSlug } from 'is-valid-slug';
import all from 'it-all';
import { JsonObject } from 'type-fest';

import { InvalidSlugError, ItemDoesNotExistError } from './errors';
import { Storage } from './storage';
import { Entry } from './types';

class MockStorage extends Storage {
  readonly data: Map<string, Map<string, JsonObject>>;

  constructor() {
    super();

    this.data = new Map<string, Map<string, JsonObject>>();
  }

  async *entries<T extends JsonObject>(
    namespace: string
  ): AsyncGenerator<Entry<T>> {
    if (isValidSlug(namespace)) {
      const mapping = this.data.get(namespace);

      if (mapping != null) {
        for (const entry of mapping.entries()) {
          yield entry as Entry<T>;
        }
      }
    } else {
      throw new InvalidSlugError('Given namespace is not valid slug');
    }
  }

  async set<T extends JsonObject>(
    namespace: string,
    key: string,
    value: T
  ): Promise<void> {
    if (!isValidSlug(namespace)) {
      throw new InvalidSlugError('Given namespace is not valid slug');
    } else if (!isValidSlug(key)) {
      throw new InvalidSlugError('Given key is not valid slug');
    } else {
      let mapping = this.data.get(namespace);

      if (!mapping) {
        mapping = new Map<string, JsonObject>();
        this.data.set(namespace, mapping);
      }
      mapping.set(key, value);
    }
  }

  async delete(namespace: string, key: string): Promise<boolean> {
    if (!isValidSlug(namespace)) {
      throw new InvalidSlugError('Given namespace is not valid slug');
    } else if (!isValidSlug(key)) {
      throw new InvalidSlugError('Given key is not valid slug');
    } else {
      const mapping = this.data.get(namespace);

      if (mapping != null) {
        return mapping.delete(key);
      }
    }

    return false;
  }
}

describe('class Storage', () => {
  const storage = new MockStorage();

  beforeEach(() => {
    storage.data.clear();
  });

  describe('keys()', () => {
    it('should list all keys stored in the namespace', async () => {
      await storage.set('items', '1', { status: 0 });
      await storage.set('items', '2', { status: 1 });

      return all(storage.keys('items')).then((result) => {
        expect(result).toHaveLength(2);
        expect(result).toContainEqual('1');
        expect(result).toContainEqual('2');
      });
    });

    it('should throw `InvalidSlugError` if given namespace is not valid slug', () =>
      expect(all(storage.keys('foo;bar'))).rejects.toBeInstanceOf(
        InvalidSlugError
      ));
  });

  describe('values()', () => {
    it('should list all values stored in the namespace', async () => {
      await storage.set('items', '1', { status: 0 });
      await storage.set('items', '2', { status: 1 });

      return all(storage.values('items')).then((result) => {
        expect(result).toHaveLength(2);
        expect(result).toContainEqual({ status: 0 });
        expect(result).toContainEqual({ status: 1 });
      });
    });
  });

  describe('has()', () => {
    it('should return `true` if an entry with given key exists in the namespace', async () => {
      await storage.set('items', '1', { status: 0 });

      return expect(storage.has('items', '1')).resolves.toBe(true);
    });

    it('should return `false` if an entry with given key does not exist in the namespace', async () => {
      await storage.set('items', '1', { status: 0 });

      return expect(storage.has('items', '2')).resolves.toBe(false);
    });
  });

  describe('get()', () => {
    it('should return value of an entry with matching key if it exists', async () => {
      await storage.set('items', '1', { status: 0 });

      return expect(storage.get('items', '1')).resolves.toEqual({ status: 0 });
    });

    it('should return `undefined` if entry with matching key does not exist', async () => {
      await storage.set('items', '1', { status: 0 });

      return expect(storage.get('items', '2')).resolves.toBeUndefined();
    });
  });

  describe('find()', () => {
    it('should return first entry to which the callback returns `true` for', async () => {
      await storage.set('items', '1', { status: 0 });
      await storage.set('items', '2', { status: 1 });

      return expect(
        storage.find('items', (value) => value.status === 1)
      ).resolves.toEqual(['2', { status: 1 }]);
    });

    it("should return `undefined` if given callback doesn't return `true` for any of entries", async () => {
      await storage.set('items', '1', { status: 0 });
      await storage.set('items', '2', { status: 1 });

      return expect(
        storage.find('items', (value) => value.status === 3)
      ).resolves.toBeUndefined();
    });
  });

  describe('filter()', () => {
    it('should return all entries to which given callback returns `true` for', async () => {
      await storage.set('items', '1', { status: 0 });
      await storage.set('items', '2', { status: 1 });

      return all(storage.filter('items', (value) => value.status === 1)).then(
        (result) => {
          expect(result).toHaveLength(1);
          expect(result).toContainEqual(['2', { status: 1 }]);
        }
      );
    });
  });

  describe('map()', () => {
    it('should apply callback on each entry in the storage', async () => {
      await storage.set('items', '1', { status: 0 });
      await storage.set('items', '2', { status: 1 });

      return all(
        storage.map('items', (value) => ({ name: `Item ${value.status}` }))
      ).then((result) => {
        expect(result).toHaveLength(2);
        expect(result).toContainEqual(['1', { name: 'Item 0' }]);
        expect(result).toContainEqual(['2', { name: 'Item 1' }]);
      });
    });
  });

  describe('update()', () => {
    it('should update an entry that already exists', async () => {
      await storage.set('items', '1', { status: 0 });

      return storage.update('items', '1', { status: 1 }).then((result) => {
        expect(result).toEqual({ status: 1 });
        expect(storage.data.get('items')?.get('1')).toEqual({ status: 1 });
      });
    });

    it('should throw `ItemDoesNotExistError` if attempting to update an item that does not exist', async () => {
      await storage.set('items', '1', { status: 0 });

      return expect(
        storage.update('items', '2', { status: 1 })
      ).rejects.toBeInstanceOf(ItemDoesNotExistError);
    });
  });
});
