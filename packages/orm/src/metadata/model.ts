import 'reflect-metadata';

import { Storage } from '@varasto/storage';
import { isValidSlug } from 'is-valid-slug';
import { Class, JsonObject } from 'type-fest';
import { v4 as uuid } from 'uuid';

import { ConfigurationError, ModelMissingMetadataError } from '../error';
import { FieldMetadata } from './field';
import slugify from 'slugify';

const METADATA_KEY = 'varasto:metadata';

export class ModelMetadata {
  public readonly target: Function;
  public readonly fields: FieldMetadata[];
  private _namespace: string | undefined;
  public keyPropertyName: string | symbol | undefined;
  public keyGenerator: (<T extends Object>(instance: T) => string) | undefined;

  public constructor(target: Function) {
    this.target = target;
    this.fields = [];
  }

  public static getFor<T extends Function>(target: T): ModelMetadata {
    let metadata;

    if (Reflect.hasOwnMetadata(METADATA_KEY, target)) {
      metadata = Reflect.getMetadata(METADATA_KEY, target);
    } else {
      metadata = new ModelMetadata(target);
      Reflect.defineMetadata(METADATA_KEY, metadata, target);
    }

    return metadata;
  }

  public static requireFor<T extends Object>(
    target: Class<T> | Function
  ): Promise<ModelMetadata> {
    return new Promise<ModelMetadata>((resolve, reject) => {
      const metadata = Reflect.getMetadata(METADATA_KEY, target);

      if (metadata) {
        resolve(metadata);
      } else {
        reject(new ModelMissingMetadataError<T>(target));
      }
    });
  }

  public get namespace(): string {
    if (!this._namespace) {
      throw new ConfigurationError(`Model ${this.target} has no namespace.`);
    }

    return this._namespace;
  }

  public set namespace(namespace: string) {
    if (!isValidSlug(namespace)) {
      throw new ConfigurationError(
        `Namespace is not valid slug: ${namespace}`
      );
    }
    this._namespace = namespace;
  }

  public load<T extends Object>(key: string, data: JsonObject): T {
    const instance = Object.create(this.target.prototype);

    if (!this.keyPropertyName) {
      throw new ConfigurationError(
        `Model ${this.target} has no key property.`
      );
    }
    Reflect.set(instance, this.keyPropertyName, key);
    this.fields.forEach((field) => field.load(instance, data));

    return instance;
  }

  public save<T extends Object>(storage: Storage, instance: T): Promise<T> {
    const data: JsonObject = {};
    let key: string;

    if (!this.keyPropertyName) {
      return Promise.reject(
        new ConfigurationError(`Model ${this.target} has no key property.`)
      );
    }
    this.clean(instance);
    this.fields.forEach((field) => field.save(instance, data));
    if (!(key = Reflect.get(instance, this.keyPropertyName))) {
      key = this.keyGenerator ? this.keyGenerator(instance) : uuid();
      Reflect.set(instance, this.keyPropertyName, key);
    }

    return storage.set(this.namespace, key, data).then(() => instance);
  }

  private clean<T extends Object>(instance: T) {
    const cleanMethod = Reflect.get(instance, 'clean');

    if (typeof cleanMethod === 'function') {
      cleanMethod.apply(instance);
    }
  }
}
