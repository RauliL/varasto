# @varasto/orm

[![npm][npm-image]][npm-url]

An attempt to build an [ORM] that uses [Varasto] as it's backend. It's still
very basic and can store only simple data.

[npm-image]: https://img.shields.io/npm/v/@varasto/orm.svg
[npm-url]: https://npmjs.org/package/@varasto/orm
[orm]: https://en.wikipedia.org/wiki/Object%E2%80%93relational_mapping
[varasto]: https://github.com/RauliL/varasto

- [Installation](#installation)
- [Usage](#usage)
  - [Retrieval](#retrieval)
  - [Insertion](#insertion)
  - [Update](#update)
  - [Removal](#removal)
  - [Querying](#querying)
  - [Validation](#validation)
    - [Class level](#class-level)
    - [Field level](#field-level)
      - [Built-in validators](#built-in-validators)
        - [minValidator](#minvalidator)
        - [maxValidator](#maxvalidator)
        - [minMaxValidator](#minmaxvalidator)
        - [regexpValidator](#regexpvalidator)

## TODO list

This ORM implementation is still on very early stage. Some missing features
that would make it more complete and usable are:

- Support for arrays.
- Support for enumerations. (Kind of already implemented.)
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
all the properties of that class that you wish to be persisted with `Field`
decorator. Model class also needs an identifier / key property that is type
of string and decorator with `Key` decorator.

Currently only boolean, number and string values are supported for fields.

```TypeScript
import { Field, Key, Model } from '@varasto/orm';

@Model()
class User {
  @Key()
  id?: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
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
import { get, list } from '@varasto/orm';

// Retrieves an user instance from the storage, identified by given key. If an
// user with the given key does not exist, the promise will fail.
const user = await get(storage, User, 'c8d676f8-fb38-11ed-8fac-4fd6a4acc103');

// Retrieves all users from the storage.
const allUsers = await list(storage, User);
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
import { get, save, updateAll } from '@varasto/orm';

// Retrieve an user from the storage that we know already exists there.
const user = await get(storage, User, 'c8d676f8-fb38-11ed-8fac-4fd6a4acc103');

// Update some of it's properties.
user.isActive = false;

// And store it into the storage. Because the user instance already has an key,
// an update will be performed instead of insertion.
await save(storage, user);

// Perform an bulk update that deactives all users whose first name is not
// "John".
const deactivatedUsers = await updateAll(
  storage,
  User,
  { firstName: { $neq: 'John' } },
  { isActive: false }
);
```

### Removal

```TypeScript
import { get, remove, removeAll } from '@varasto/orm';

// Again let's retrieve an user from the storage.
const user = await get(storage, User, 'c8d676f8-fb38-11ed-8fac-4fd6a4acc103');

// And immediately remove it from the storage afterwards. After this operation
// the user instance will no longer have a key.
await remove(storage, user);

// Perform an bulk removal which deletes all users whose last name is "Doe".
const removedUserCount = await removeAll(storage, User, { lastName: 'Doe' });
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

See [simple-json-match] for documentation on how the query schemas work. Notice
that model keys cannot be included in the queries, as they are stored
separately from the other model data.

[simple-json-match]: https://www.npmjs.com/package/simple-json-match

### Validation

#### Class level

If an model class has method called `clean`, it will be always called before an
model is stored into the storage.

This method can be used to perform validation or modify values of the fields
before they are inserted into the storage.

```TypeScript
import { Field, Key, Model } from '@varasto/orm';

@Model()
class User {
  @Key()
  id?: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
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

#### Field level

Each field in the model class can be given an array of validator functions.
These functions are called before the model instance is stored into the storage
and they should throw instance of `ValidationError` if the given value is not
valid.

```TypeScript
import { Field, Model, ValidationError } from '@varasto/orm';

const validateX = (x: number) => {
  if (x < 0 || x > 100) {
    throw new ValidationError('Value of "x" must be between 0 and 100');
  }
};

const validateY = (y: number) => {
  if (y < 50) {
    throw new ValidationError('Value of "y" must be at least 50');
  }
};

@Model()
class Point {
  @Field({ validators: [validateX] })
  x: number;

  @Field({ validators: [validateY] })
  y: number;
}
```

##### Built-in validators

This package comes with 4 built-in validator function generators.

###### minValidator

```TypeScript
minValidator(
  min: number,
  errorMessage: string
) => (value: any) => void
```

Creates an validator function that will throw an validation error with given
error message if the value is less than the given minimum value.

###### maxValidator

```TypeScript
maxValidator(
  max: number,
  errorMessage: string
) => (value: any) => void
```

Creates an validator function that will throw an validation error with given
error message if the value is greater than the given maximum value.

###### minMaxValidator

```TypeScript
minMaxValidator(
  min: number,
  max: number,
  errorMessage: string
) => (value: any) => void
```

Creates an validator function that will throw an validation error with given
error message if the value is not in the range of given minimum and maximum
values.

###### regexpValidator

```TypeScript
regexpValidator(
  pattern: RegExp,
  errorMessage: string
) => (value: any) => void
```

Creates an validator function that will throw an validation error with given
error message if the value does not match given regular expression.
