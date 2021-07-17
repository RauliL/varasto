/**
 * Various options that can be given to file system storage instance.
 */
export type FileSystemStorageOptions = {
  /** Path to the directory where items are being stored. */
  dir: string;
  /** Character encoding to use. Defaults to UTF-8. */
  encoding: string;
};
