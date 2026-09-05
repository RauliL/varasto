/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import 'reflect-metadata';

import { Class, JsonObject } from 'type-fest';

import { ConfigurationError } from '../error.js';

const EMBEDDED_METADATA_KEY = 'varasto:embedded-metadata';

export interface EmbeddedField {
  load(instance: object, data: JsonObject): void;
  save(instance: object, data: JsonObject): void;
}

export class EmbeddedMetadata {
  public readonly target: Function;
  public readonly fields: EmbeddedField[];
  public embedded = false;

  public constructor(target: Function) {
    this.target = target;
    this.fields = [];
  }

  public static getFor<T extends Function>(target: T): EmbeddedMetadata {
    let metadata = Reflect.getMetadata(EMBEDDED_METADATA_KEY, target) as
      EmbeddedMetadata | undefined;

    if (!metadata) {
      metadata = new EmbeddedMetadata(target);
      Reflect.defineMetadata(EMBEDDED_METADATA_KEY, metadata, target);
    }

    return metadata;
  }

  public static isEmbedded(target: Function): boolean {
    const metadata = Reflect.getMetadata(EMBEDDED_METADATA_KEY, target) as
      EmbeddedMetadata | undefined;

    return metadata?.embedded === true;
  }

  public static requireFor<T extends object>(
    target: Class<T>
  ): EmbeddedMetadata {
    const metadata = Reflect.getMetadata(EMBEDDED_METADATA_KEY, target) as
      EmbeddedMetadata | undefined;

    if (!metadata?.embedded) {
      throw new ConfigurationError(
        `${target.name} is not an embedded class. Did you forget @Embedded()?`
      );
    }

    if (metadata.fields.length === 0) {
      throw new ConfigurationError(`${target.name} has no fields.`);
    }

    return metadata;
  }

  public load<T extends object>(data: JsonObject): T {
    const instance = Object.create(this.target.prototype) as T;

    this.fields.forEach((field) => field.load(instance, data));

    return instance;
  }

  public save(instance: object): JsonObject {
    const data: JsonObject = {};

    this.fields.forEach((field) => field.save(instance, data));

    return data;
  }
}
