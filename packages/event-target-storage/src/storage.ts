import { Storage } from '@varasto/storage';
import { JsonObject } from 'type-fest';
import { TypedEventTarget } from 'typescript-event-target';

import { OperationPreventedError } from './errors';
import {
  PreDeleteEvent,
  PreSetEvent,
  PreUpdateEvent,
  PostDeleteEvent,
  PostSetEvent,
  PostUpdateEvent,
} from './events';
import { EventTargetStorage, StorageEventMap } from './types';

export const createEventTargetStorage = (
  storage: Storage
): EventTargetStorage => {
  const target = new TypedEventTarget<StorageEventMap>();

  return {
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target),
    dispatchTypedEvent: target.dispatchTypedEvent.bind(target),

    entries: storage.entries.bind(storage),
    keys: storage.keys.bind(storage),
    values: storage.values.bind(storage),
    has: storage.has.bind(storage),
    get: storage.get.bind(storage),
    find: storage.find.bind(storage),
    filter: storage.filter.bind(storage),
    map: storage.map.bind(storage),

    delete: (namespace: string, key: string): Promise<boolean> =>
      target.dispatchTypedEvent(
        'pre-delete',
        new PreDeleteEvent(namespace, key)
      )
        ? storage.delete(namespace, key).then((result) => {
            target.dispatchTypedEvent(
              'post-delete',
              new PostDeleteEvent(namespace, key, result)
            );

            return result;
          })
        : Promise.reject(
            new OperationPreventedError('Deletion was prevented')
          ),

    set: <T extends JsonObject>(
      namespace: string,
      key: string,
      value: T
    ): Promise<void> =>
      target.dispatchTypedEvent(
        'pre-set',
        new PreSetEvent(namespace, key, value)
      )
        ? storage.set(namespace, key, value).then(() => {
            target.dispatchTypedEvent(
              'post-set',
              new PostSetEvent(namespace, key, value)
            );
          })
        : Promise.reject(
            new OperationPreventedError('Insertion was prevented')
          ),

    update: <T extends JsonObject>(
      namespace: string,
      key: string,
      value: Partial<T>
    ): Promise<T> =>
      target.dispatchTypedEvent(
        'pre-update',
        new PreUpdateEvent(namespace, key, value)
      )
        ? storage.update(namespace, key, value).then((result) => {
            target.dispatchTypedEvent(
              'post-update',
              new PostUpdateEvent(namespace, key, value, result)
            );

            return result;
          })
        : Promise.reject(new OperationPreventedError('Update was prevented')),
  };
};
