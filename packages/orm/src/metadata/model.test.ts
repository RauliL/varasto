import { createMemoryStorage } from '@varasto/memory-storage';
import { describe, expect, it, vi } from 'vitest';

import { Field, Key, Model } from '../decorator';
import { ConfigurationError, ModelMissingMetadataError } from '../error';
import { ModelMetadata } from './model';

describe('class ModelMetadata', () => {
  describe('requireFor()', () => {
    it('should return metadata class for an model class', () => {
      @Model()
      class MockModel {}

      return expect(
        ModelMetadata.requireFor(MockModel)
      ).resolves.toBeInstanceOf(ModelMetadata);
    });

    it("should throw `ModelMissingMetadataError` for classes that haven't been decorated with `Model`", () => {
      class MockModel {}

      return expect(
        ModelMetadata.requireFor(MockModel)
      ).rejects.toBeInstanceOf(ModelMissingMetadataError);
    });
  });

  describe('get namespace', () => {
    it('should return configured namespace of the model', () => {
      const metadata = new ModelMetadata(String);

      metadata.namespace = 'foo';

      expect(metadata.namespace).toEqual('foo');
    });

    it('should throw `ConfigurationError` if model has namespace configured', () => {
      const metadata = new ModelMetadata(String);

      expect(() => metadata.namespace).toThrow(ConfigurationError);
    });
  });

  describe('set namespace', () => {
    it('should throw `ConfigurationError` if namespace is not valid slug', () => {
      const metadata = new ModelMetadata(String);

      expect(() => {
        metadata.namespace = '';
      }).toThrow(ConfigurationError);
    });
  });

  describe('load()', () => {
    it('should throw `ConfigurationError` when the model class is missing key property', () => {
      @Model()
      class MockModel {
        @Field()
        value?: string;
      }

      expect(() =>
        ModelMetadata.getFor(MockModel).load('foo', { value: 'bar' })
      ).toThrow(ConfigurationError);
    });
  });

  describe('save()', () => {
    it('should allow use of custom key generators', () => {
      const mockKeyGenerator = vi.fn(() => 'foo');
      @Model()
      class MockModel {
        @Key({ generator: mockKeyGenerator })
        id?: string;
      }
      const instance = new MockModel();

      return ModelMetadata.getFor(MockModel)
        .save(createMemoryStorage(), instance)
        .then((result) => {
          expect(result).toBe(instance);
          expect(result).toHaveProperty('id', 'foo');
          expect(mockKeyGenerator).toBeCalledWith(instance);
        });
    });

    it('should throw `ConfigurationError` when the model class is missing key property', () => {
      @Model()
      class MockModel {
        @Field()
        value?: string;
      }

      return expect(
        ModelMetadata.getFor(MockModel).save(createMemoryStorage(), {})
      ).rejects.toBeInstanceOf(ConfigurationError);
    });
  });
});
