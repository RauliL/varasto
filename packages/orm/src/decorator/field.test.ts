/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expect, it } from 'vitest';

import { ConfigurationError } from '../error.js';
import { Field } from './field.js';
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
});
