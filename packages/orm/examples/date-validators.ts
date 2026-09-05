/**
 * Date fields with min, max, and range validators.
 *
 * Validators accept both numbers and Date boundaries. Dates are stored as ISO
 * 8601 strings and restored as Date instances on load.
 *
 * Use a factory default such as `() => new Date()` when each instance should
 * receive its own timestamp instead of sharing one fixed value.
 */
import 'reflect-metadata';

import { createMemoryStorage } from '@varasto/memory-storage';
import {
  Field,
  Key,
  Model,
  ValidationError,
  get,
  maxValidator,
  minMaxValidator,
  minValidator,
  save,
} from '@varasto/orm';

const storage = createMemoryStorage();

const year2024Start = new Date('2024-01-01T00:00:00.000Z');
const year2024End = new Date('2024-12-31T23:59:59.999Z');

@Model({ namespace: 'events' })
class Event {
  @Key()
  id?: string;

  @Field({ type: 'string' })
  title: string;

  @Field({
    type: 'date',
    default: () => new Date(),
  })
  createdAt: Date;

  @Field({
    type: 'date',
    validators: [
      minValidator(year2024Start, 'Event cannot be scheduled before 2024'),
      maxValidator(year2024End, 'Event cannot be scheduled after 2024'),
    ],
  })
  scheduledAt: Date;

  @Field({
    type: 'date',
    validators: [
      minMaxValidator(
        new Date('2024-06-01T00:00:00.000Z'),
        new Date('2024-08-31T23:59:59.999Z'),
        'Summer events must fall between June and August 2024'
      ),
    ],
  })
  summerSlot?: Date;

  constructor(title: string, scheduledAt: Date, summerSlot?: Date) {
    this.title = title;
    this.scheduledAt = scheduledAt;
    this.summerSlot = summerSlot;
  }
}

const validEvent = new Event(
  'ORM workshop',
  new Date('2024-03-15T14:00:00.000Z'),
  new Date('2024-07-10T10:00:00.000Z')
);

await save(storage, validEvent);

console.log('Saved valid event:');
console.log('  id:', validEvent.id);
console.log(
  '  stored JSON:',
  JSON.stringify(await storage.get('events', validEvent.id!), null, 2)
);

const loaded = await get(storage, Event, validEvent.id!);

console.log('\nLoaded event:');
console.log('  createdAt:', loaded.createdAt.toISOString());
console.log('  createdAt is Date:', loaded.createdAt instanceof Date);
console.log('  scheduledAt:', loaded.scheduledAt.toISOString());
console.log('  summerSlot:', loaded.summerSlot?.toISOString());

console.log('\nValidation failures:');

const tooEarly = new Event(
  'Past meetup',
  new Date('2023-12-31T23:59:59.999Z')
);

try {
  await save(storage, tooEarly);
} catch (error) {
  console.log(
    '  too early:',
    error instanceof ValidationError ? error.message : error
  );
}

const outsideSummer = new Event(
  'Autumn conference',
  new Date('2024-10-01T09:00:00.000Z'),
  new Date('2024-10-01T09:00:00.000Z')
);

try {
  await save(storage, outsideSummer);
} catch (error) {
  console.log(
    '  outside summer window:',
    error instanceof ValidationError ? error.message : error
  );
}
