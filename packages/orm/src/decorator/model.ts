/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import slugify from 'slugify';

import { ModelMetadata } from '../metadata/index.js';
import { ModelOptions } from '../options/index.js';

export const Model =
  (options: ModelOptions = {}): ClassDecorator =>
  <T extends Function>(target: T) => {
    const namespace =
      options.namespace ?? slugify(target.name, { lower: true });
    const metadata = ModelMetadata.getFor(target);

    metadata.namespace = namespace;

    return target;
  };
