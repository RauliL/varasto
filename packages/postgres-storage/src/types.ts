/**
 * Various options that can be given to PostgreSQL storage instance.
 */
export type PostgresStorageOptions = {
  /**
   * If set as `true`, tables associated to namespaces will be automatically
   * dropped once they are detected to be empty, i.e. no longer contain any
   * entries.
   */
  dropEmptyTables: boolean;
};
