import { Class } from 'type-fest';

export class ConfigurationError extends Error {
  name = 'ConfigurationError';

  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

export class ModelMissingMetadataError<T extends Object> extends Error {
  name = 'ModelMissingMetadataError';

  public constructor(target: Class<T> | Function) {
    super();
    Object.setPrototypeOf(this, ModelMissingMetadataError.prototype);
    this.message = `Model class ${target.constructor.name} is missing it\'s metadata.`;
  }
}

export class ModelDoesNotExistError extends Error {
  name = 'ModelDoesNotExistError';

  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ModelDoesNotExistError.prototype);
  }
}

export class ValidationError<T extends Object> extends Error {
  name = 'ValidationError';

  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
