/**
 * Embedded classes as single fields and as arrays.
 *
 * Define reusable shapes with @Embedded() and reference them via `of` (single
 * object) or `items` (array of objects). Nested embedding is supported.
 */
import 'reflect-metadata';

import { createMemoryStorage } from '@varasto/memory-storage';
import {
  Embedded,
  Field,
  Key,
  Model,
  get,
  save,
} from '@varasto/orm';

const storage = createMemoryStorage();

@Embedded()
class Address {
  @Field({ type: 'string' })
  city: string;

  @Field({ type: 'string' })
  country: string;

  constructor(city: string, country: string) {
    this.city = city;
    this.country = country;
  }
}

@Embedded()
class Person {
  @Field({ type: 'string' })
  name: string;

  @Field({ type: 'number' })
  age: number;

  @Field({ type: 'embedded', of: Address })
  address: Address;

  constructor(name: string, age: number, address: Address) {
    this.name = name;
    this.age = age;
    this.address = address;
  }
}

@Model({ namespace: 'teams' })
class Team {
  @Key()
  id?: string;

  @Field({ type: 'string' })
  name: string;

  @Field({ type: 'embedded', of: Person })
  captain: Person;

  @Field({ type: 'embedded[]', items: Person })
  members: Person[];

  constructor(name: string, captain: Person, members: Person[]) {
    this.name = name;
    this.captain = captain;
    this.members = members;
  }
}

const team = new Team(
  'Engineering',
  new Person('Ada', 36, new Address('London', 'UK')),
  [
    new Person('Ada', 36, new Address('London', 'UK')),
    new Person('Bob', 28, new Address('Paris', 'France')),
    new Person('Chen', 31, new Address('Berlin', 'Germany')),
  ]
);

await save(storage, team);

console.log('Stored JSON:');
console.log(JSON.stringify(await storage.get('teams', team.id!), null, 2));

const loaded = await get(storage, Team, team.id!);

console.log('\nLoaded model:');
console.log('  team:', loaded.name);
console.log(
  '  captain:',
  loaded.captain.name,
  'from',
  loaded.captain.address.city
);
console.log('  captain is Person:', loaded.captain instanceof Person);
console.log('  address is Address:', loaded.captain.address instanceof Address);
console.log(
  '  members:',
  loaded.members.map((member) => `${member.name} (${member.address.city})`)
);
