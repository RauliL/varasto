/**
 * Scalar array fields: string[], number[], boolean[], and date[].
 *
 * Array element types must be declared explicitly via `items` or `type`,
 * because decorator metadata only reports `Array`, not the element type.
 */
import 'reflect-metadata';

import { createMemoryStorage } from '@varasto/memory-storage';
import { Field, Key, Model, get, save } from '@varasto/orm';

const storage = createMemoryStorage();

@Model({ namespace: 'articles' })
class Article {
  @Key()
  id?: string;

  @Field({ type: 'string[]' })
  tags: string[];

  @Field({ type: 'number[]' })
  scores: number[];

  @Field({ type: 'boolean[]' })
  flags: boolean[];

  @Field({ type: 'date[]' })
  revisionDates: Date[];

  constructor(
    tags: string[],
    scores: number[],
    flags: boolean[],
    revisionDates: Date[]
  ) {
    this.tags = tags;
    this.scores = scores;
    this.flags = flags;
    this.revisionDates = revisionDates;
  }
}

const article = new Article(
  ['typescript', 'orm', 'arrays'],
  [95, 88, 92],
  [true, false, true],
  [
    new Date('2024-01-15T12:00:00.000Z'),
    new Date('2024-06-01T00:00:00.000Z'),
  ]
);

await save(storage, article);

console.log('Stored JSON:');
console.log(JSON.stringify(await storage.get('articles', article.id!), null, 2));

const loaded = await get(storage, Article, article.id!);

console.log('\nLoaded model:');
console.log('  tags:', loaded.tags);
console.log('  scores:', loaded.scores);
console.log('  flags:', loaded.flags);
console.log(
  '  revisionDates:',
  loaded.revisionDates.map((date) => date.toISOString())
);
console.log('  first revision is Date:', loaded.revisionDates[0] instanceof Date);
