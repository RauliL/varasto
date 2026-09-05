import { describe, expect, it } from 'vitest';

import { ConfigurationError } from '../error.js';
import { EmbeddedMetadata } from '../metadata/embedded.js';
import { Embedded } from './embedded.js';
import { Field } from './field.js';

describe('@Embedded decorator', () => {
  it('should register embedded field metadata on the class', () => {
    @Embedded()
    class Person {
      @Field()
      name: string;

      @Field()
      age: number;
    }

    expect(EmbeddedMetadata.requireFor(Person).fields).toHaveLength(2);
  });

  it('should throw if embedded class is used before @Embedded is applied', () => {
    class Person {
      @Field()
      name: string;
    }

    expect(() => EmbeddedMetadata.requireFor(Person)).toThrow(
      ConfigurationError
    );
  });
});
