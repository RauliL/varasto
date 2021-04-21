# @varasto/mock-storage

Mock [storage](../storage/README.md) implementation that stores values in
memory instead of hard disk and is useful when writing test cases.

## Installation

```bash
$ npm install --save-dev @varasto/mock-storage
```

## Usage

```TypeScript
import { createMockStorage } from '@varasto/mock-storage';

const storage = createMockStorage();
```
