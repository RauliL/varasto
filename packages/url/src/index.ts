import { Storage } from '@varasto/storage';

const createMemoryStorage = async (): Promise<Storage> => {
  const { createMemoryStorage } = await import('@varasto/memory-storage');
  return createMemoryStorage();
};

const createFileStorage = async (url: URL): Promise<Storage> => {
  const { createFileSystemStorage } = await import('@varasto/fs-storage');
  return createFileSystemStorage({
    dir: url.pathname,
  });
};

const createRemoteStorage = async (url: URL): Promise<Storage> => {
  let auth: Record<'username' | 'password', string> | undefined;

  if (url.username || url.password) {
    auth = {
      username: url.username,
      password: url.password,
    };
  }

  const { createRemoteStorage } = await import('@varasto/remote-storage');
  return createRemoteStorage({
    auth,
    url: url.toString(),
  });
};

const createPostgresStorage = async (url: URL): Promise<Storage> => {
  const { Client } = await import('pg');
  const { parse } = await import('pg-connection-string');
  const { createPostgresStorage } = await import('@varasto/postgres-storage');
  const client = new Client(
    parse(url.toString()) as import('pg').ClientConfig
  );

  await client.connect();

  return createPostgresStorage(client);
};

const createRedisStorage = async (url: URL): Promise<Storage> => {
  const { createRedisStorage } = await import('@varasto/redis-storage');
  const { createClient } = await import('redis');
  return createRedisStorage(createClient({ url: url.toString() }));
};

const createSqliteStorage = async (url: URL): Promise<Storage> => {
  const sqlite = await import('sqlite');
  const sqlite3 = await import('sqlite3');
  const { createSqliteStorage } = await import('@varasto/sqlite-storage');
  const client = await sqlite.open({
    filename: url.href.substring(url.protocol.length),
    driver: sqlite3.Database,
  });

  return createSqliteStorage(client);
};

export const open = async (input: string | URL): Promise<Storage> => {
  const url = input instanceof URL ? input : new URL(input);

  switch (url.protocol) {
    case 'memory:':
      return createMemoryStorage();

    case 'file:':
      return createFileStorage(url);

    case 'http:':
    case 'https:':
      return createRemoteStorage(url);

    case 'postgres:':
      return createPostgresStorage(url);

    case 'redis:':
      return createRedisStorage(url);

    case 'sqlite:':
    case 'sqlite3:':
      return createSqliteStorage(url);
  }

  throw new Error('Unrecognized Varasto URL');
};
