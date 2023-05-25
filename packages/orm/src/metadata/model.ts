import 'reflect-metadata';

import { JsonObject } from 'type-fest';

import { ModelMissingMetadataError } from '../error';
import { FieldMetadata } from './field';

export class ModelMetadata<T extends Function> {
  public readonly target: Function;
  public readonly fields: FieldMetadata<T>[];
  public namespace: string | undefined;
  public keyPropertyName: string | symbol | undefined;
  public keyGenerator: (() => string) | undefined;

  private constructor(target: Function) {
    this.target = target;
    this.fields = [];
  }

  public static getFor<T extends Function>(target: T): ModelMetadata<T> {
    let metadata;

    if (Reflect.hasOwnMetadata('varasto:metadata', target)) {
      metadata = Reflect.getMetadata('varasto:metadata', target);
    } else {
      metadata = new ModelMetadata<T>(target);
      Reflect.defineMetadata('varasto:metadata', metadata, target);
    }

    return metadata;
  }

  public static requireFor<T extends Function>(
    target: T
  ): Promise<ModelMetadata<T>> {
    return new Promise<ModelMetadata<T>>((resolve, reject) => {
      const metadata = Reflect.getMetadata('varasto:metadata', target);

      if (metadata) {
        resolve(metadata);
      } else {
        reject(new ModelMissingMetadataError<T>(target));
      }
    });
  }

  public load(key: string, data: JsonObject): T {
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
