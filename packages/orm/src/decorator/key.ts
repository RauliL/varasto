import 'reflect-metadata';

import { ConfigurationError } from '../error';
import { ModelMetadata } from '../metadata';
import { KeyOptions } from '../options';

export const Key =
  (options: KeyOptions = {}): PropertyDecorator =>
  (target: object, propertyKey: string | symbol) => {
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
