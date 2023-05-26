import { ConfigurationError } from '../error';
import { Key } from './key';
import { Model } from './model';

describe('Key decorator', () => {
  it('should throw `ConfigurationError` if the decorator is applied to non-string property', () => {
    expect(() => {
      @Model()
      class MockModel {
        @Key()
        id?: boolean;
      }
    }).toThrow(ConfigurationError);
  });

  it('should throw `ConfigurationError` if model class has multiple keys', () => {
    expect(() => {
      @Model()
      class MockModel {
        @Key()
        id1?: string;

        @Key()
        id2?: string;
      }
    }).toThrow(ConfigurationError);
  });
});
