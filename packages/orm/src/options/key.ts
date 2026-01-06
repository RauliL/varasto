/**
 * Various options that can be given to model key.
 */
export type KeyOptions = {
  /**
   * Function which generates new keys. If omitted, UUID will be used as key
   * for new model instances.
   */
  generator?: <T extends object>(instance: T) => string;
};
