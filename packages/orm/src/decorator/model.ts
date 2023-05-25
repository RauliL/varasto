import { isValidSlug } from 'is-valid-slug';
import slugify from 'slugify';

import { ConfigurationError } from '../error';
import { ModelMetadata } from '../metadata';

/**
 * Various options that can be passed to an model class.
 */
export type ModelOptions = {
  /**
   * Namespace where instances of the model will be stored into.
   */
  namespace: string;
};

export const Model =
  (options: Partial<ModelOptions> = {}): ClassDecorator =>
  <T extends Function>(target: T) => {
    const namespace =
      options.namespace ?? slugify(target.name, { lower: true });
    const metadata = ModelMetadata.getFor(target);

    if (!isValidSlug(namespace)) {
      throw new ConfigurationError(
        `Namespace is not valid slug: ${namespace}`
      );
    }

    metadata.namespace = namespace;

    return target;
  };
