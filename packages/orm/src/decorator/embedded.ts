/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { ModelMetadata } from '../metadata/model.js';
import { EmbeddedMetadata } from '../metadata/embedded.js';
import { FieldMetadata } from '../metadata/field.js';

export const Embedded =
  (): ClassDecorator =>
  <T extends Function>(target: T) => {
    const embeddedMetadata = EmbeddedMetadata.getFor(target);

    embeddedMetadata.embedded = true;

    const modelMetadata = Reflect.getMetadata('varasto:metadata', target) as
      ModelMetadata | undefined;

    if (modelMetadata?.fields.length) {
      embeddedMetadata.fields.push(
        ...modelMetadata.fields.map(
          (field) =>
            new FieldMetadata(
              embeddedMetadata,
              field.propertyName,
              field.options
            )
        )
      );
      modelMetadata.fields.length = 0;
    }

    return target;
  };
