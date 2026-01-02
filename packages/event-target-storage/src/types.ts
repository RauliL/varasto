import { Storage } from '@varasto/storage';
import { JsonObject } from 'type-fest';
import { TypedEventTarget } from 'typescript-event-target';

import {
  PostDeleteEvent,
  PostSetEvent,
  PostUpdateEvent,
  PreDeleteEvent,
  PreSetEvent,
  PreUpdateEvent,
} from './events';

export type StorageEventMap = {
  'pre-delete': PreDeleteEvent;
  'post-delete': PostDeleteEvent;
  'pre-set': PreSetEvent;
  'post-set': PostSetEvent;
  'pre-update': PreUpdateEvent;
  'post-update': PostUpdateEvent;
};

export type EventTargetStorage = Storage & TypedEventTarget<StorageEventMap>;
