import 'reflect-metadata';

import { Class, JsonObject } from 'type-fest';

import { ModelMissingMetadataError } from '../error';
import { FieldMetadata } from './field';

export class ModelMetadata {
  public readonly target: Function;
  public readonly fields: FieldMetadata[];
  public namespace: string | undefined;
  public keyPropertyName: string | symbol | undefined;
  public keyGenerator: (() => string) | undefined;

  private constructor(target: Function) {
    this.target = target;
    this.fields = [];
  }

  public static getFor<T extends Function>(target: T): ModelMetadata {
    let metadata;

    if (Reflect.hasOwnMetadata('varasto:metadata', target)) {
      metadata = Reflect.getMetadata('varasto:metadata', target);
    } else {
      metadata = new ModelMetadata(target);
      Reflect.defineMetadata('varasto:metadata', metadata, target);
    }

    return metadata;
  }

  public static requireFor<T extends Object>(
    target: Class<T> | Function
  ): Promise<ModelMetadata> {
    return new Promise<ModelMetadata>((resolve, reject) => {
      const metadata = Reflect.getMetadata('varasto:metadata', target);

      if (metadata) {
        resolve(metadata);
      } else {
        reject(new ModelMissingMetadataError<T>(target));
      }
    });
  }

  public load<T extends Object>(key: string, data: JsonObject): T {
    const instance = Object.create(this.target.prototype);

    if (this.keyPropertyName) {
      Reflect.set(instance, this.keyPropertyName, key);
    }
    this.fields.forEach((field) => field.load(instance, data));

    return instance;
  }

  public save<T extends Object>(instance: T, data: JsonObject) {
    this.clean(instance);
    this.fields.forEach((field) => field.save(instance, data));
  }

  private clean<T extends Object>(instance: T) {
    const cleanMethod = Reflect.get(instance, 'clean');

    if (typeof cleanMethod === 'function') {
      cleanMethod.apply(instance);
    }
  }
}
