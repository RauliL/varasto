import { JsonObject } from 'type-fest';

type CacheEntry<T> = {
  expires?: number;
  value: T;
};

const isExpired = <T>(entry: CacheEntry<T>): boolean =>
  entry.expires != null && Date.now() >= entry.expires;

/**
 * Simple map based cache implementation with TTL.
 */
export class Cache<T> {
  private readonly ttl?: number;
  private readonly storage: Map<string, CacheEntry<T>>;

  public constructor(ttl?: number) {
    this.ttl = ttl;
    this.storage = new Map();
  }

  public get isEmpty(): boolean {
    return this.storage.size === 0;
  }

  public get(key: string): T | undefined {
    const entry = this.storage.get(key);

    return entry != null && !isExpired(entry) ? entry.value : undefined;
  }

  public set(key: string, value: T) {
    this.storage.set(key, {
      expires: this.ttl != null ? Date.now() + this.ttl : undefined,
      value,
    });
  }

  public delete(key: string) {
    this.storage.delete(key);
  }
}

export class NamespaceCache {
  private readonly ttl?: number;
  private readonly storage: Map<string, Cache<JsonObject>>;

  public constructor(ttl?: number) {
    this.ttl = ttl;
    this.storage = new Map();
  }

  public get(namespace: string, key: string): JsonObject | undefined {
    return this.storage.get(namespace)?.get(key);
  }

  public set(namespace: string, key: string, value: JsonObject) {
    let cache = this.storage.get(namespace);

    if (!cache) {
      cache = new Cache<JsonObject>(this.ttl);
      this.storage.set(namespace, cache);
    }
    cache.set(key, value);
  }

  public delete(namespace: string, key: string) {
    const cache = this.storage.get(namespace);

    if (cache) {
      cache.delete(key);
      if (cache.isEmpty) {
        this.storage.delete(namespace);
      }
    }
  }
}
