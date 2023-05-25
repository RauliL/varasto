export class ConfigurationError extends Error {
  name = 'ConfigurationError';

  public constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

export class ModelMissingMetadataError<T extends Function> extends Error {
  name = 'ModelMissingMetadataError';

  public constructor(target: T) {
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
