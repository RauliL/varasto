import 'reflect-metadata';

import { ConfigurationError } from '../error';
import { ModelMetadata } from '../metadata';

/**
 * Various options that can be given to model key.
 */
export type KeyOptions = {
  /**
   * Function which generates new keys. If omitted, UUID will be used as key
   * for new model instances.
   */
  generator: () => string;
};

export const Key =
  (options: Partial<KeyOptions> = {}): PropertyDecorator =>
  (target: Object, propertyKey: string | symbol) => {
    const type = Reflect.getMetadata('design:type', target, propertyKey);
    const modelMetadata = ModelMetadata.getFor(target.constructor);

    if (type && type !== String) {
      throw new ConfigurationError(`"${type}" cannot be used as key.`);
    } else if (modelMetadata.keyPropertyName) {
      throw new ConfigurationError(
        `${modelMetadata.target} has multiple keys.`
      );
    }
    modelMetadata.keyPropertyName = propertyKey;
    modelMetadata.keyGenerator = options.generator;
  };
