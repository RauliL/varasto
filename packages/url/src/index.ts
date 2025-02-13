export const connect = async (input: string) => {
  const url = new URL(input);

  if (url.protocol === 'http:' || url.protocol === 'https:') {
    const { createRemoteStorage } = await import('@varasto/remote-storage');
    let auth;

    if (url.username && url.password) {
      auth = {
        username: url.username,
        password: url.password,
      };
    }

    return createRemoteStorage({ auth, url: input });
  } else if (url.protocol === 'file:') {
    const { createFileSystemStorage } = await import('@varasto/fs-storage');

    return createFileSystemStorage({ dir: input });
  } else if (url.protocol === 'memory:') {
    const { createMemoryStorage } = await import('@varasto/memory-storage');

    return createMemoryStorage();
  }

  throw new Error('Unsupported storage URL');
};
