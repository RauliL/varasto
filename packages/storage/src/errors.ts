/**
 * Exception which is thrown if an invalid slug is used as either namespace or
 * key of an item.
 */
export class InvalidSlugError extends Error {
  public constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = InvalidSlugError.name;
  }
}

/**
 * Exception which is thrown when an item is updated that does not exist.
 */
export class ItemDoesNotExistError extends Error {
  public constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = ItemDoesNotExistError.name;
  }
}
