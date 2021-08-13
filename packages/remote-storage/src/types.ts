/**
 * Authentication credentials for the remote storage.
 */
export type RemoteStorageAuthentication = {
  username: string;
  password: string;
};

/**
 * Various options that can be given to the remote storage.
 */
export type RemoteStorageOptions = {
  /** URL of the server. */
  url: string;
  /** Optional authentication credentials. */
  auth?: RemoteStorageAuthentication;
};
