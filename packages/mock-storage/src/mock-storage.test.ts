import { createMockStorage } from './mock-storage';

describe('mock storage', () => {
  it('should be able to store items', async () => {
    const storage = createMockStorage();

    expect(storage.has('foo', 'bar')).toBe(false);
    await storage.set('foo', 'bar', { test: true });
    expect(storage.has('foo', 'bar')).toBe(true);
  });

  it('should be able to retrieve items', async () => {
    const storage = createMockStorage();

    expect(await storage.get('foo', 'bar')).toBeUndefined();
    await storage.set('foo', 'bar', { test: true });
    expect(await storage.get('foo', 'bar')).toEqual({ test: true });
  });

  it('should be able to remove items', async () => {
    const storage = createMockStorage();

    expect(await storage.delete('foo', 'bar')).toBe(false);
    await storage.set('foo', 'bar', { test: true });
    expect(await storage.delete('foo', 'bar')).toBe(true);
    expect(storage.has('foo', 'bar')).toBe(false);
  });

  it('should be able to clear all data', async () => {
    const storage = createMockStorage();

    await storage.set('ns1', 'key', { foo: 'bar' });
    await storage.set('ns2', 'key', { foo: 'bar' });
    storage.clear();
    expect(storage.has('ns1', 'key')).toBe(false);
    expect(storage.has('ns2', 'key')).toBe(false);
  });

  it('should be able to list keys', async () => {
    const storage = createMockStorage();

    await storage.set('foo', 'bar', { a: 1 });
    await storage.set('foo', 'baz', { b: 2 });

    const result = await storage.keys('foo');

    expect(result).toHaveLength(2);
    expect(result).toContain('bar');
    expect(result).toContain('baz');

    expect(await storage.keys('bar')).toHaveLength(0);
  });

  it('should be able to list values', async () => {
    const storage = createMockStorage();

    await storage.set('foo', 'bar', { a: 1 });
    await storage.set('foo', 'baz', { b: 2 });

    const result = await storage.values('foo');

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({ a: 1 });
    expect(result).toContainEqual({ b: 2 });

    expect(await storage.values('bar')).toHaveLength(0);
  });

  it('should be able to list entries', async () => {
    const storage = createMockStorage();

    await storage.set('foo', 'bar', { a: 1 });
    await storage.set('foo', 'baz', { b: 2 });

    const result = await storage.entries('foo');

    expect(result).toHaveLength(2);
    expect(result).toContainEqual(['bar', { a: 1 }]);
    expect(result).toContainEqual(['baz', { b: 2 }]);

    expect(await storage.entries('bar')).toHaveLength(0);
  });
});
