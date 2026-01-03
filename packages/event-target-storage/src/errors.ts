/**
 * Exception which is thrown when an insertion, update or delete operation was
 * prevented by calling `preventDefault()` method on storage event.
 */
export class OperationPreventedError extends Error {
  public constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = OperationPreventedError.name;
  }
}
