import { ConfigurationError } from '../error';
import { Field } from './field';
import { Model } from './model';

describe('Field decorator', () => {
  it('should throw `ConfigurationError` if applied to property of unsupported type', () => {
    expect(() => {
      @Model()
      class MockModel {
        @Field()
        value?: Object;
      }
    }).toThrow(ConfigurationError);
  });
});
