# @varasto/orm

An attempt to build an [ORM] that uses [Varasto] as it's backend. It's still
very basic and can store only simple data.

[orm]: https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping
[varasto]: https://github.com/RauliL/varasto

## TODO list

This ORM implementation is still on very early stage. Some missing features
that would make it more complete and usable are:

- Support for arrays.
- Support for enumerations.
- One-to-one and one-to-many relations.

## Installation

Install the NPM package:

```bash
$ npm install --save @varasto/orm
```

Install [reflect-metadata] shim:

```bash
$ npm install --save reflect-metadata
```

And import it somewhere in the global place of your application.

And then make sure that decorator support has been enabled by adding following
lines to your `tsconfig.json`:

```JSON
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```

[reflect-metadata]: https://github.com/rbuckton/reflect-metadata

## Usage

Define an model class by adding `Model` decorator to an class. Then decorate
all the properties of that class that you wish to be persisted with `Column`
decorator. Model class also needs an identifier / key property that is type
of string and decorator with `Key` decorator.

Currently only boolean, number and string values are supported for columns.

```TypeScript
import { Column, Key, Model } from '@varasto/orm';

@Model()
class User {
  @Key()
  id?: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  isActive: boolean;

  constructor(firstName: string, lastName: string, isActive: boolean = true) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.isActive = isActive;
  }
}
```

### Retrieval

```TypeScript
import { get } from '@varasto/orm';

// Retrieves an user instance from the storage, identified by given key. If an
// user with the given key does not exist, the promise will fail.
const user = await get(storage, User, 'c8d676f8-fb38-11ed-8fac-4fd6a4acc103');
```

### Insertion

```TypeScript
import { save } from '@varasto/orm';

// Create new user instance without a key.
const user = new User('John', 'Doe', true);

// And store it into the storage. After this operation the user instance will
// have an automatically generated UUID key.
await save(storage, user);
```

### Update

```TypeScript
import { get, save } from '@varasto/orm';

// Retrieve an user from the storage that we know already exists there.
const user = await get(storage, User, 'c8d676f8-fb38-11ed-8fac-4fd6a4acc103');

// Update some of it's properties.
user.isActive = false;

// And store it into the storage. Because the user instance already has an key,
// an update will be performed instead of insertion.
await save(storage, user);
```

### Removal

```TypeScript
import { get, remove } from '@varasto/orm';

// Again let's retrieve an user from the storage.
const user = await get(storage, User, 'c8d676f8-fb38-11ed-8fac-4fd6a4acc103');

// And immediately remove it from the storage afterwards. After this operation
// the user instance will no longer have a key.
await remove(storage, user);
```

### Querying

```TypeScript
import { count, find, findAll, keys } from '@varasto/orm';

// Retrieve the total number of users stored in storage.
const totalNumberOfUsers = await count(storage, User);

// Retrieve all keys of users stored in storage.
const allUserKeys = await keys(storage, User);

// Find the first user which `firstName` property is "John". If no such user
// exists in the storage, `undefined` will be returned instead.
const john = await find(storage, User, { firstName: 'John' });

// Retrieve all inactive users.
const allInactiveUsers = await findAll(storage, User, { isActive: false });
```

### Validation

If an model class has method called `clean`, it will be always called before an
model is stored into the storage.

This method can be used to perform validation or modify values of the fields
before they are inserted into the storage.

```TypeScript
import { Column, Key, Model } from '@varasto/orm';

@Model()
class User {
  @Key()
  id?: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  isActive: boolean;

  constructor(firstName: string, lastName: string, isActive: boolean = true) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.isActive = isActive;
  }

  clean() {
    if (this.firstName.length === 0) {
      throw new Error('User must have a first name.');
    }

    // Limit maximum length of users last name to 5 just to annoy people.
    if (this.lastName.length > 5) {
      this.lastName = this.lastName.substr(0, 5);
    }
  }
}
```
