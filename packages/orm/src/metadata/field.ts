import { JsonObject } from 'type-fest';

import { FieldType } from '../types';
import { ModelMetadata } from './model';

export class FieldMetadata {
  public readonly model: ModelMetadata;
  public readonly propertyName: string | symbol;
  public readonly type: FieldType;
  public readonly defaultValue?: boolean | number | string | null;

  public constructor(
    model: ModelMetadata,
    propertyName: string | symbol,
    type: FieldType,
    defaultValue?: boolean | number | string | null
  ) {
    this.model = model;
    this.propertyName = propertyName;
    this.type = type;
    this.defaultValue = defaultValue;
  }

  public load<T extends Object>(instance: T, data: JsonObject) {
    Reflect.set(
      instance,
      this.propertyName,
      Reflect.get(data, this.propertyName)
    );
  }

  public save<T extends Object>(instance: T, data: JsonObject) {
    let value = Reflect.get(instance, this.propertyName);

    if (value === undefined) {
      value = this.defaultValue;
      Reflect.set(instance, this.propertyName, value);
    }

    Reflect.set(data, this.propertyName, value);
  }
}
