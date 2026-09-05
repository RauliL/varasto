import { JsonObject } from 'type-fest';
import { describe, expect, it, vi } from 'vitest';

import { Embedded, Field } from '../decorator/index.js';
import { ValidationError } from '../error.js';
import { FieldMetadata } from './field.js';
import { ModelMetadata } from './model.js';

describe('class FieldMetadata', () => {
  const mockModelMetadata = new ModelMetadata(String);

  describe('load()', () => {
    it('should use default value when one is provided and the actual value is missing', () => {
      const metadata = new FieldMetadata(mockModelMetadata, 'foo', {
        default: 'bar',
      });
      const instance = {};

      metadata.load(instance, {});

      expect(instance).toHaveProperty('foo', 'bar');
    });

    it('should deserialize ISO date strings into `Date` instances', () => {
      const metadata = new FieldMetadata(mockModelMetadata, 'createdAt', {
        type: 'date',
      });
      const instance = {};

      metadata.load(instance, { createdAt: '2024-01-15T12:00:00.000Z' });

      expect(instance).toHaveProperty('createdAt');
      expect((instance as { createdAt: Date }).createdAt).toBeInstanceOf(Date);
      expect(
        (instance as { createdAt: Date }).createdAt.toISOString()
      ).toEqual('2024-01-15T12:00:00.000Z');
    });

    it('should throw `ValidationError` if stored date value is invalid', () => {
      const metadata = new FieldMetadata(mockModelMetadata, 'createdAt', {
        type: 'date',
      });

      expect(() => metadata.load({}, { createdAt: 'not-a-date' })).toThrow(
        ValidationError
      );
    });

    it('should deserialize ISO date strings in array fields', () => {
      const metadata = new FieldMetadata(mockModelMetadata, 'dates', {
        type: 'date[]',
      });
      const instance = {};

      metadata.load(instance, {
        dates: ['2024-01-15T12:00:00.000Z', '2024-06-01T00:00:00.000Z'],
      });

      const dates = (instance as { dates: Date[] }).dates;

      expect(dates).toHaveLength(2);
      expect(dates[0]).toBeInstanceOf(Date);
      expect(dates[1].toISOString()).toEqual('2024-06-01T00:00:00.000Z');
    });
  });

  describe('save()', () => {
    it('should use default value when one is provided and the actual value is missing', () => {
      const metadata = new FieldMetadata(mockModelMetadata, 'foo', {
        default: 'bar',
      });
      const data: JsonObject = {};

      metadata.save({}, data);

      expect(data).toHaveProperty('foo', 'bar');
    });

    it('should throw `ValidationError` is value is not in the given array of choices', () => {
      const metadata = new FieldMetadata(mockModelMetadata, 'foo', {
        type: 'number',
        choices: [1, 2, 3, 4, 5],
      });

      expect(() => metadata.save({ foo: 6 }, {})).toThrow(ValidationError);
    });

    it('should throw `ValidationError` if an array value contains disallowed choice', () => {
      const metadata = new FieldMetadata(mockModelMetadata, 'tags', {
        type: 'string[]',
        choices: ['a', 'b', 'c'],
      });

      expect(() => metadata.save({ tags: ['a', 'd'] }, {})).toThrow(
        ValidationError
      );
    });

    it('should accept array values when every element is in choices', () => {
      const metadata = new FieldMetadata(mockModelMetadata, 'tags', {
        type: 'string[]',
        choices: ['a', 'b', 'c'],
      });
      const data: JsonObject = {};

      metadata.save({ tags: ['a', 'c'] }, data);

      expect(data).toHaveProperty('tags', ['a', 'c']);
    });

    it('should run validator functions given to the field', () => {
      const mockValidator = vi.fn();
      const metadata = new FieldMetadata(mockModelMetadata, 'foo', {
        type: 'string',
        validators: [mockValidator],
      });

      metadata.save({ foo: 'value' }, {});

      expect(mockValidator).toBeCalledWith('value');
    });

    it('should serialize `Date` instances into ISO strings', () => {
      const metadata = new FieldMetadata(mockModelMetadata, 'createdAt', {
        type: 'date',
      });
      const data: JsonObject = {};
      const createdAt = new Date('2024-01-15T12:00:00.000Z');

      metadata.save({ createdAt }, data);

      expect(data).toHaveProperty('createdAt', '2024-01-15T12:00:00.000Z');
    });

    it('should serialize `Date` arrays into ISO strings', () => {
      const metadata = new FieldMetadata(mockModelMetadata, 'dates', {
        type: 'date[]',
      });
      const data: JsonObject = {};

      metadata.save(
        {
          dates: [
            new Date('2024-01-15T12:00:00.000Z'),
            new Date('2024-06-01T00:00:00.000Z'),
          ],
        },
        data
      );

      expect(data).toHaveProperty('dates', [
        '2024-01-15T12:00:00.000Z',
        '2024-06-01T00:00:00.000Z',
      ]);
    });
  });
});

describe('embedded field metadata', () => {
  @Embedded()
  class Person {
    @Field()
    name: string;

    @Field()
    age: number;

    constructor(name: string = '', age: number = 0) {
      this.name = name;
      this.age = age;
    }
  }

  const mockModelMetadata = new ModelMetadata(String);

  it('should serialize and deserialize embedded object fields', () => {
    const metadata = new FieldMetadata(mockModelMetadata, 'owner', {
      type: 'embedded',
      of: Person,
    });
    const data: JsonObject = {};
    const owner = new Person('Ada', 36);

    metadata.save({ owner }, data);

    expect(data).toEqual({ owner: { name: 'Ada', age: 36 } });

    const instance = {};

    metadata.load(instance, data);

    expect((instance as { owner: Person }).owner).toBeInstanceOf(Person);
    expect((instance as { owner: Person }).owner).toMatchObject({
      name: 'Ada',
      age: 36,
    });
  });

  it('should serialize and deserialize embedded object arrays', () => {
    const metadata = new FieldMetadata(mockModelMetadata, 'members', {
      type: 'embedded[]',
      items: Person,
    });
    const data: JsonObject = {};

    metadata.save(
      {
        members: [new Person('Ada', 36), new Person('Bob', 28)],
      },
      data
    );

    expect(data).toEqual({
      members: [
        { name: 'Ada', age: 36 },
        { name: 'Bob', age: 28 },
      ],
    });

    const instance = {};

    metadata.load(instance, data);

    const members = (instance as { members: Person[] }).members;

    expect(members).toHaveLength(2);
    expect(members[0]).toBeInstanceOf(Person);
    expect(members[1]).toMatchObject({ name: 'Bob', age: 28 });
  });
});
