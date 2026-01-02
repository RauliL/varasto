import { JsonObject } from 'type-fest';

export type StorageEventType =
  | 'post-delete'
  | 'post-set'
  | 'post-update'
  | 'pre-delete'
  | 'pre-set'
  | 'pre-update';

export abstract class StorageEvent extends Event {
  public namespace: string;
  public key: string;

  public constructor(type: StorageEventType, namespace: string, key: string) {
    super(type, { cancelable: type.startsWith('pre-') });
    this.namespace = namespace;
    this.key = key;
  }
}

export class PreDeleteEvent extends StorageEvent {
  public constructor(namespace: string, key: string) {
    super('pre-delete', namespace, key);
  }
}

export class PostDeleteEvent extends StorageEvent {
  public result: boolean;

  public constructor(namespace: string, key: string, result: boolean) {
    super('post-delete', namespace, key);

    this.result = result;
  }
}

export abstract class SetEvent extends StorageEvent {
  public value: JsonObject;

  public constructor(
    type: 'pre-set' | 'post-set',
    key: string,
    namespace: string,
    value: JsonObject
  ) {
    super(type, key, namespace);
    this.value = value;
  }
}

export class PreSetEvent extends SetEvent {
  public constructor(key: string, namespace: string, value: JsonObject) {
    super('pre-set', key, namespace, value);
  }
}

export class PostSetEvent extends SetEvent {
  public constructor(key: string, namespace: string, value: JsonObject) {
    super('post-set', key, namespace, value);
  }
}

export abstract class UpdateEvent extends StorageEvent {
  public value: Partial<JsonObject>;

  public constructor(
    type: 'pre-update' | 'post-update',
    namespace: string,
    key: string,
    value: Partial<JsonObject>
  ) {
    super(type, namespace, key);
    this.value = value;
  }
}

export class PreUpdateEvent extends UpdateEvent {
  public constructor(
    key: string,
    namespace: string,
    value: Partial<JsonObject>
  ) {
    super('pre-update', key, namespace, value);
  }
}

export class PostUpdateEvent extends UpdateEvent {
  public result: JsonObject;

  public constructor(
    key: string,
    namespace: string,
    value: Partial<JsonObject>,
    result: JsonObject
  ) {
    super('post-update', key, namespace, value);
    this.result = result;
  }
}
