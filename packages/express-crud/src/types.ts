import { JsonObject } from 'type-fest';
import { ZodType } from 'zod/v4';

/**
 * Various options that can be given to an router.
 */
export type RouterOptions<T extends JsonObject = JsonObject> = {
  /**
   * Function used to generate keys for new items. If omitted, UUIDs will be
   * generated as keys instead.
   */
  keyGenerator: (data: T) => string;

  /**
   * Optional schema to validate data against.
   */
  schema: ZodType<T>;
};
