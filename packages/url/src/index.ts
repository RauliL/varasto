/* eslint-disable @typescript-eslint/no-require-imports */
import { Storage } from '@varasto/storage';

const createMemoryStorage = (): Storage =>
  require('@varasto/memory-storage').createMemoryStorage();

const createFileStorage = (url: URL): Storage =>
  require('@varasto/fs-storage').createFileSystemStorage({
    dir: url.pathname,
  });

const createRemoteStorage = (url: URL): Storage => {
  let auth: Record<'username' | 'password', string> | undefined;

  if (url.username || url.password) {
    auth = {
      username: url.username,
      password: url.password,
    };
  }

  return require('@varasto/remote-storage').createRemoteStorage({
    auth,
    url: url.toString(),
  });
};

const createPostgresStorage = async (url: URL): Promise<Storage> => {
  const client = new (require('pg').Client)(
    require('pg-connection-string').parse(url.toString())
  );

  await client.connect();

  return require('@varasto/postgres-storage').createPostgresStorage(client);
};

const createRedisStorage = (url: URL): Storage =>
  require('@varasto/redis-storage').createRedisStorage(
    require('redis').createClient({ url: url.toString() })
  );

const createSqliteStorage = (url: URL): Promise<Storage> =>
  require('sqlite')
    .open({
      filename: url.href.substr(url.protocol.length),
      driver: require('sqlite3').Database,
    })
    .then((client: object) =>
      require('@varasto/sqlite-storage').createSqliteStorage(client)
    );

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
      return await createPostgresStorage(url);

    case 'redis:':
      return createRedisStorage(url);

    case 'sqlite:':
    case 'sqlite3:':
      return await createSqliteStorage(url);
  }

  throw new Error('Unrecognized Varasto URL');
};
