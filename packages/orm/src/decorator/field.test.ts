/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expect, it } from 'vitest';

import { ConfigurationError } from '../error.js';
import { Embedded, Field } from './index.js';
import { Model } from './model.js';

describe('Field decorator', () => {
  it('should throw `ConfigurationError` if applied to property of unsupported type', () => {
    expect(() => {
      @Model()
      class MockModel {
        @Field()
        value?: object;
      }
    }).toThrow(ConfigurationError);
  });

  it('should accept `Date` properties', () => {
    expect(() => {
      @Model()
      class MockModel {
        @Field()
        createdAt?: Date;
      }
    }).not.toThrow();
  });

  it('should accept array properties when `items` is provided', () => {
    expect(() => {
      @Model()
      class MockModel {
        @Field({ items: 'string' })
        tags?: string[];
      }
    }).not.toThrow();
  });

  it('should accept array properties when array `type` is provided', () => {
    expect(() => {
      @Model()
      class MockModel {
        @Field({ type: 'number[]' })
        scores?: number[];
      }
    }).not.toThrow();
  });

  it('should throw `ConfigurationError` if array property has no element type', () => {
    expect(() => {
      @Model()
      class MockModel {
        @Field()
        tags?: string[];
      }
    }).toThrow(ConfigurationError);
  });

  it('should accept embedded array properties when `items` is an embedded class', () => {
    @Embedded()
    class Person {
      @Field()
      name: string;
    }

    expect(() => {
      @Model()
      class Team {
        @Field({ items: Person })
        members?: Person[];
      }
    }).not.toThrow();
  });

  it('should accept embedded object properties when `of` is provided', () => {
    @Embedded()
    class Person {
      @Field()
      name: string;
    }

    expect(() => {
      @Model()
      class Team {
        @Field({ type: 'embedded', of: Person })
        owner?: Person;
      }
    }).not.toThrow();
  });

  it('should infer embedded object type from property declaration', () => {
    @Embedded()
    class Person {
      @Field()
      name: string;
    }

    expect(() => {
      @Model()
      class Team {
        @Field()
        owner?: Person;
      }
    }).not.toThrow();
  });

  it('should accept enum fields when `enum` is provided', () => {
    enum Status {
      Active = 'active',
      Inactive = 'inactive',
    }

    expect(() => {
      @Model()
      class Task {
        @Field({ enum: Status })
        status?: Status;
      }
    }).not.toThrow();
  });

  it('should accept enum array fields when `enum` is provided', () => {
    enum Status {
      Active = 'active',
      Inactive = 'inactive',
    }

    expect(() => {
      @Model()
      class Task {
        @Field({ enum: Status, type: 'enum[]' })
        history?: Status[];
      }
    }).not.toThrow();
  });

  it('should throw if enum array field has no `enum` option', () => {
    expect(() => {
      @Model()
      class Task {
        @Field({ type: 'enum[]' })
        history?: string[];
      }
    }).toThrow(ConfigurationError);
  });
});
