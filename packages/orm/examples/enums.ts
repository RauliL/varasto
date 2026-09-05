/**
 * TypeScript enum fields and enum arrays.
 *
 * Pass the enum object via the `enum` option. Allowed values are derived
 * automatically and validated on save and load. Values are stored in JSON as
 * their underlying string or number representation.
 */
import 'reflect-metadata';

import { createMemoryStorage } from '@varasto/memory-storage';
import {
  Field,
  Key,
  Model,
  ValidationError,
  get,
  save,
} from '@varasto/orm';

const storage = createMemoryStorage();

enum Role {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

enum Priority {
  Low = 0,
  Medium = 1,
  High = 2,
}

@Model({ namespace: 'tasks' })
class Task {
  @Key()
  id?: string;

  @Field({ type: 'string' })
  title: string;

  @Field({ enum: Role, default: Role.User })
  role: Role;

  @Field({ enum: Priority })
  priority: Priority;

  @Field({ enum: Role, type: 'enum[]' })
  allowedRoles: Role[];

  constructor(
    title: string,
    role: Role,
    priority: Priority,
    allowedRoles: Role[]
  ) {
    this.title = title;
    this.role = role;
    this.priority = priority;
    this.allowedRoles = allowedRoles;
  }
}

const task = new Task(
  'Ship enum support',
  Role.Admin,
  Priority.High,
  [Role.Admin, Role.User]
);

await save(storage, task);

console.log('Stored JSON:');
console.log(JSON.stringify(await storage.get('tasks', task.id!), null, 2));

const loaded = await get(storage, Task, task.id!);

console.log('\nLoaded model:');
console.log('  role:', loaded.role);
console.log('  priority:', loaded.priority);
console.log('  allowedRoles:', loaded.allowedRoles);
console.log('  role matches enum member:', loaded.role === Role.Admin);

console.log('\nValidation failure:');

const invalidTask = new Task(
  'Invalid role',
  'superuser' as Role,
  Priority.Low,
  [Role.Guest]
);

try {
  await save(storage, invalidTask);
} catch (error) {
  console.log(
    '  invalid enum value:',
    error instanceof ValidationError ? error.message : error
  );
}
