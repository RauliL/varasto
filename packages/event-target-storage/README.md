# @varasto/event-target-storage

[![npm][npm-image]][npm-url]

Middleware for an [storage] that allows [events] to be emitted when items are
inserted or deleted, kind of like [PostgreSQL triggers].

[npm-image]: https://img.shields.io/npm/v/@varasto/event-target-storage.svg
[npm-url]: https://npmjs.org/package/@varasto/event-target-storage
[storage]: https://www.npmjs.com/package/@varasto/storage
[events]: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events
[PostgreSQL triggers]: https://www.postgresql.org/docs/8.1/triggers.html

## Installation

```sh
$ npm install --save @varasto/event-target-storage
```

## Usage

The package provides an function called `createEventTargetStorage` which takes
another [Storage] instance as an argument and returns a new [Storage] instance
that extends [EventTarget] interface, allowing event listeners to be added and
removed.

When new item is being inserted, existing item is updated or deleted an event
will be dispatched that can be received by the event listeners added with the
`addEventListener` method.

[EventTarget]: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget

### Dispatched events

| Event type    | Event description                                  |
| ------------- | -------------------------------------------------- |
| `pre-set`     | Dispatched before an item is about to be inserted. |
| `post-set`    | Dispatched after an item has been inserted.        |
| `pre-update`  | Dispatched before an item is about to be updated.  |
| `post-update` | Dispatched after an item has been updated.         |
| `pre-delete`  | Dispatched before an item is about to be deleted.  |
| `post-delete` | Dispatched after an item has been deleted.         |

### Example

```TypeScript
import { createEventTargetStorage } from '@varasto/event-target-storage';
import { createMemoryStorage } from '@varasto/memory-storage';

const memoryStorage = createMemoryStorage();
const eventTargetStorage = createEventTargetStorage(memoryStorage);

// This event listener will be called before an item is inserted into the
// storage.
eventTargetStorage.addEventListener('pre-set', (event) => {
  // We can call `.preventDefault()` for the event if we want to prevent the
  // item to be inserted. This causes the promise returned by `.set()` to fail.
  if (event.namespace === 'foo' && event.key === 'bar') {
    console.log('Insertion of foo to bar is not allowed');
    event.preventDefault();
  }
});

// This event listener will be called after an item has been successfully
// inserted into the storage.
eventTargetStorage.addEventListener('post-set', (event) => {
  console.log(`Added ${event.key} to ${event.namespace}`);
});

// This event listener will be called before an item is updated in the storage.
eventTargetStorage.addEventListener('pre-update', (event) => {
  // We can again prevent the update by calling `.preventDefault()` on the
  // event. This causes the promise returned by `.update()` to fail.
  if ('scary-property' in event.value) {
    console.log('No scary properties allowed');
    event.preventDefault();
  }
});

// This event listener will be called after an item has been successfully
// updated in the storage.
eventTargetStorage.addEventListener('post-update', (event) => {
  console.log(`An update ${event.value} resulted into ${event.result}`);
});

// This event listener will be called before an item is deleted from the
// storage.
eventTargetStorage.addEventListener('pre-delete', (event) => {
  // We can prevent the deletion by calling `.preventDefault()` on the event.
  if (event.namespace === 'foo' && event.key === 'bar') {
    console.log('This is too important to be deleted');
    event.preventDefault();
  }
});

// This event listener will be called after an item has been successfully
// deleted from the storage.
eventTargetStorage.addEventListener('post-delete', (event) => {
  if (event.result) {
    console.log(`${event.key} from ${event.namespace} deleted`);
  } else {
    console.log(`${event.key} does not exist in ${event.namespace}`);
  }
});
```
